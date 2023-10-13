import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import  { NotFoundException, Res } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDetailsDto } from './dtos/update-user-details.dto';
import { CreateMatchResultDto } from './dtos/create-match-result.dto';
import { MatchHistory } from './entities/match-history.entity';
import { GameTypeEnum } from 'src/enums/game-type.enum';
import { GameModeEnum } from 'src/enums/game-mode.enum';
import { GameSpeedEnum } from 'src/enums/game-speed.enum';
import { ShowUserOverviewDto } from './dtos/show-user-overview.dto';

@Injectable()
export class UsersService {

    constructor (
        @InjectRepository(User)
        private userRespository: Repository<User>,
        @InjectRepository(MatchHistory)
        private matchHistoryRepository: Repository<MatchHistory>
    ){}

    findAllUsers(): Promise<User[]> {
        return this.userRespository.find();
    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        const user = new User();
        Object.assign(user, userDto);
        // const user = this.userRespository.create({ 
        //     email: createUserDto.email,
        //     nickname: createUserDto.nickname
        // });
        await this.userRespository.save(user);
        return user;
    }

    async findById(id: number): Promise<User | null> {
        const found = await this.userRespository.findOneBy({id});
        console.log("FOUND: ", found)
        return found;
    }
    
    
    async removeUser(id: number): Promise<void> {
        await this.userRespository.delete(id);
    }

    async findByEmail(email: string): Promise <User | null> {
        const options: FindOneOptions<User> = { where: { email }};
        const found = await this.userRespository.findOne(options);
        return found;
    }

    async updateUser(id: number, userDto: UpdateUserDetailsDto): Promise<void> {
        const user = await this.findById(id);
        if (user == null) {
            throw new NotFoundException(`User with ID ${id} not found`); // 안해줘도 될듯
        }
        Object.assign(user, userDto);
        user.nickname = userDto.nickname;
        await this.userRespository.save(user);
    }

    async findMatchHistoriesByUserId(userId: number) : Promise<MatchHistory[]>{
        console.log(userId);
        const matchHistories = await this.matchHistoryRepository.createQueryBuilder('match_history')
        .leftJoinAndSelect('match_history.opponentUser', 'opponentUser')
        .where('match_history.user_id = :userId', {userId: userId})
        .getMany();

        for (const matchHistory of matchHistories) {
            console.log(matchHistory)
        }
        return matchHistories;
    }

    async findAllMatchHistories(): Promise<MatchHistory[]> {
        return await this.matchHistoryRepository.find();
    }

    async saveMatchResult(matchDto: CreateMatchResultDto): Promise<void> {
        const matchResult = new MatchHistory();
        Object.assign(matchResult, matchDto);
        await this.matchHistoryRepository.save(matchResult)
    }

    // 아래는 테스트용 코드입니다. 웹서버 실행시 실행됌
    async testAddUser() : Promise<void> {
        const users = [
            { email: "dhbdg11@gmail.com", nickname: "spew11" },
            { email: "user2@example.com", nickname: "user2" },
            { email: "user3@example.com", nickname: "user3" },
            { email: "user4@example.com", nickname: "user4" },
            { email: "user5@example.com", nickname: "user5" },
            { email: "user6@example.com", nickname: "user6" },
            { email: "user7@example.com", nickname: "user7" },
            { email: "user8@example.com", nickname: "user8" },
            { email: "user9@example.com", nickname: "user9" },
            { email: "user10@example.com", nickname: "user10" }
        ];

        for (const user of users) {
            await this.createUser(user);
        }
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getRandomEnumValue<T>(anEnum: T): T[keyof T] {
        const enumValues = Object.values(anEnum);
        const randomIndex = Math.floor(Math.random() * enumValues.length);
        return enumValues[randomIndex];
    }

    async testAddHistories() : Promise<void> {
        console.log("START");
        for(let i = 0; i < 10; i++) {
            const dto:CreateMatchResultDto = new CreateMatchResultDto();
            let userId = this.getRandomInt(1, 10);
            let opponentId = this.getRandomInt(1, 10);
            while (!userId || !opponentId || userId == opponentId) {  // Ensure opponentId is not the same as userId
                opponentId = this.getRandomInt(1, 10);
            }
            // dto.userId = this.getRandomInt(1, 10);
            // dto.opponentId = this.getRandomInt(1, 10);
            // while (!dto.userId || !dto.opponentId || dto.userId == dto.opponentId) {  // Ensure opponentId is not the same as userId
            //     dto.opponentId = this.getRandomInt(1, 10);
            // }
            // console.log("USER_ID: ", dto.userId);
            dto.user = await this.findById(userId);
            console.log("USER: ", dto.user.nickname);
            dto.opponentUser = await this.findById(opponentId);
            dto.myScore = this.getRandomInt(0, 100);
            dto.opponentScore = this.getRandomInt(0, 100);
            dto.gameType = this.getRandomEnumValue(GameTypeEnum);
            dto.gameMode = this.getRandomEnumValue(GameModeEnum);
            dto.gameSpeed = this.getRandomEnumValue(GameSpeedEnum);
            dto.lpChange = this.getRandomInt(-100, 100), // 랜덤한 값으로 LP 변경
            await this.saveMatchResult(dto);
        }
        console.log("END");
    }
}