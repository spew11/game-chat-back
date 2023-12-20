import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SecureShieldService } from 'src/secure-shield/secure-shield.service';
import { MatchHistory } from 'src/users/entities/match-history.entity';
import { MatchResult } from 'src/users/enums/match-result.enum';
import { Match } from 'src/games/game/games.match';
import { gameType } from 'src/games/enums/game-type.enum';
import { promises as fs } from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private secureShieldService: SecureShieldService,
    @InjectRepository(MatchHistory)
    private matchHistoryRepository: Repository<MatchHistory>,
  ) {}

  findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  createUser(userEmail: string, filename: string, createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.save({
      email: userEmail,
      ...(filename ? { avatarImgPath: `/static/uploads/${filename}` } : {}),
      ...createUserDto,
    });
  }

  findByNickname(nickname: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        nickname: nickname,
      },
    });
  }

  findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findUserDetailById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        matchHistorys: true,
      },
    });
  }

  findByEmail(email: string): Promise<User> {
    const options: FindOneOptions<User> = { where: { email } };
    return this.userRepository.findOne(options);
  }

  async updateUserAvatar(user: User, filename: string): Promise<User> {
    if (user.avatarImgPath) {
      try {
        await fs.access(user.avatarImgPath);
        await fs.unlink(user.avatarImgPath);
      } catch (err) {
        console.log(`Failed to delete the file: ${err.message}`);
      }
    }
    user.avatarImgPath = filename ? `/static/uploads/${filename}` : null;
    return this.userRepository.save(user);
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    const existNicknameUser = await this.findByNickname(updateUserDto.nickname);
    if (existNicknameUser.id != user.id) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async activate2fa(user: User): Promise<void> {
    if (user.is2fa) {
      throw new BadRequestException('2단계 인증이 이미 활성화 상태입니다.');
    }
    user.is2fa = true;
    await this.userRepository.save(user);
  }

  async deactivate2fa(user: User): Promise<void> {
    if (user.is2fa === false) {
      throw new BadRequestException('2단계 인증이 이미 비활성화 상태입니다.');
    }
    user.is2fa = false;
    user.otpSecret = null;
    await this.userRepository.save(user);
  }

  async createSecretKey(user: User): Promise<void> {
    user.otpSecret = this.secureShieldService.encrypt(this.secureShieldService.generateSecretKey());
    await this.userRepository.save(user);
  }

  async saveMatchHistory(match: Match): Promise<MatchHistory[]> {
    const user1 = await this.findById(match.player1.userId);
    const user2 = await this.findById(match.player2.userId);

    const resultByPlayer1 =
      match.player1.score > match.player2.score ? MatchResult.WIN : MatchResult.LOSS;
    const lpChangeByPlayer1 = match.type === gameType.LADDER ? Math.floor(Math.random() * 100) : 0;
    const historyByPlayer1 = this.matchHistoryRepository.create({
      user: user1,
      opponent: user2,
      mode: match.mode,
      type: match.type,
      result: resultByPlayer1,
      userScore: match.player1.score,
      opponentScore: match.player2.score,
      lpChange: resultByPlayer1 === MatchResult.WIN ? lpChangeByPlayer1 : -lpChangeByPlayer1,
    });

    const resultByPlayer2 =
      match.player2.score > match.player1.score ? MatchResult.WIN : MatchResult.LOSS;
    const lpChangeByPlayer2 = match.type === gameType.LADDER ? Math.floor(Math.random() * 100) : 0;
    const historyByPlayer2 = this.matchHistoryRepository.create({
      user: user2,
      opponent: user1,
      mode: match.mode,
      type: match.type,
      result: resultByPlayer2,
      userScore: match.player2.score,
      opponentScore: match.player1.score,
      lpChange: resultByPlayer2 === MatchResult.WIN ? lpChangeByPlayer2 : -lpChangeByPlayer2,
    });

    const historys = await this.matchHistoryRepository.save([historyByPlayer1, historyByPlayer2]);

    user1.ladderPoint += historyByPlayer1.lpChange;
    user2.ladderPoint += historyByPlayer2.lpChange;

    await this.userRepository.save([user1, user2]);

    return historys;
  }
}
