import { GameMode } from '../enums/game-mode.enum';
import { GameStatus } from '../enums/game-status.enum';
import { gameType } from '../enums/game-type.enum';
import { Ball } from './games.ball';
import { Player } from './games.player';
import { gameSetting } from './games.setting';

export class Match {
  player1 = new Player('P1');
  player2 = new Player('P2');
  ball = new Ball();
  status: GameStatus = GameStatus.INIT;
  mode: GameMode;
  type: gameType;

  constructor(mode: GameMode, type: gameType) {
    this.mode = mode;
    this.type = type;
  }

  init(userId1: number, socketId1: string, userId2: number, socketId2: string) {
    this.player1.userId = userId1;
    this.player1.socketId = socketId1;
    this.player2.userId = userId2;
    this.player2.socketId = socketId2;

    this.status = GameStatus.READY;
  }

  moveBar() {
    const bar1 = this.player1.bar;
    const dxP1 = bar1.dir.x * bar1.speed;
    if (bar1.x + dxP1 > 0 && bar1.x + dxP1 < gameSetting.canvasWidth - bar1.width) {
      bar1.x += dxP1;
    }

    const bar2 = this.player2.bar;
    const dxP2 = bar2.dir.x * bar2.speed;
    if (bar2.x + dxP2 > 0 && bar2.x + dxP2 < gameSetting.canvasWidth - bar2.width) {
      bar2.x += dxP2;
    }
  }

  moveBall() {
    const ball = this.ball;
    const bar1 = this.player1.bar;
    const bar2 = this.player2.bar;
    const dx = ball.dir.x * ball.speed;
    const dy = ball.dir.y * ball.speed;

    ball.x += dx;
    ball.y += dy;
    // 벽과의 충돌 체크 (좌우)
    if (ball.x + ball.radius > gameSetting.canvasWidth || ball.x - ball.radius < 0) {
      ball.dir.x = -ball.dir.x;
    }
    // 하단바와의 충돌 체크
    if (ball.y + ball.radius > bar1.y && ball.x > bar1.x && ball.x < bar1.x + bar1.width) {
      ball.dir.y = -Math.abs(ball.dir.y);
      ball.speed += 0.5;
    }
    // 상단바와의 충돌 체크
    if (
      ball.y - ball.radius < bar2.y + bar2.height &&
      ball.x > bar2.x &&
      ball.x < bar2.x + bar2.width
    ) {
      ball.dir.y = Math.abs(ball.dir.y);
      ball.speed += 0.5;
    }
    // 득점체크
    if (ball.y - ball.radius < 0) {
      this.player1.score += 1;
      ball.x = gameSetting.canvasWidth / 2;
      ball.y = gameSetting.canvasHeight / 2;
      ball.dir.y = -ball.dir.y;
      ball.speed = Ball.startSpeed;
    } else if (ball.y + ball.radius > gameSetting.canvasHeight) {
      this.player2.score += 1;
      ball.x = gameSetting.canvasWidth / 2;
      ball.y = gameSetting.canvasHeight / 2;
      ball.dir.y = -ball.dir.y;
      ball.speed = Ball.startSpeed;
    }

    if (this.player1.score === 3 || this.player2.score === 3) {
      this.status = GameStatus.FINISH;
    }
  }

  moveBallExtreme() {
    const ball = this.ball;
    const bar1 = this.player1.bar;
    const bar2 = this.player2.bar;
    const dx = ball.dir.x * ball.speed;
    const dy = ball.dir.y * ball.speed;

    ball.x += dx;
    ball.y += dy;
    // 벽과의 충돌 체크 (좌우)
    if (ball.x + ball.radius > gameSetting.canvasWidth || ball.x - ball.radius < 0) {
      ball.dir.x = -ball.dir.x;
    }
    // 하단바와의 충돌 체크
    if (ball.y + ball.radius > bar1.y && ball.x > bar1.x && ball.x < bar1.x + bar1.width) {
      const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      ball.dir.x = Math.cos(angle);
      ball.dir.y = -Math.sin(angle);
      ball.dir.y = -Math.abs(ball.dir.y);
      ball.speed += 0.5;
    }
    // 상단바와의 충돌 체크
    if (
      ball.y - ball.radius < bar2.y + bar2.height &&
      ball.x > bar2.x &&
      ball.x < bar2.x + bar2.width
    ) {
      const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      ball.dir.x = Math.cos(angle);
      ball.dir.y = Math.sin(angle);
      ball.dir.y = Math.abs(ball.dir.y);
      ball.speed += 0.5;
    }
    // 득점체크
    if (ball.y - ball.radius < 0) {
      this.player1.score += 1;
      ball.x = gameSetting.canvasWidth / 2;
      ball.y = gameSetting.canvasHeight / 2;
      ball.dir.y = -ball.dir.y;
      ball.speed = Ball.startSpeed;
    } else if (ball.y + ball.radius > gameSetting.canvasHeight) {
      this.player2.score += 1;
      ball.x = gameSetting.canvasWidth / 2;
      ball.y = gameSetting.canvasHeight / 2;
      ball.dir.y = -ball.dir.y;
      ball.speed = Ball.startSpeed;
    }

    if (this.player1.score === 3 || this.player2.score === 3) {
      this.status = GameStatus.FINISH;
    }
  }

  reverse() {
    const playerReverse1 = { ...this.player1 };
    playerReverse1.bar = { ...this.player1.bar };
    playerReverse1.bar.x = gameSetting.canvasWidth - this.player1.bar.width - this.player1.bar.x;
    playerReverse1.bar.y = gameSetting.canvasHeight - this.player1.bar.height - this.player1.bar.y;
    const playerReverse2 = { ...this.player2 };
    playerReverse2.bar = { ...this.player2.bar };
    playerReverse2.bar.x = gameSetting.canvasWidth - this.player2.bar.width - this.player2.bar.x;
    playerReverse2.bar.y = gameSetting.canvasHeight - this.player2.bar.height - this.player2.bar.y;
    const ballReverse = { ...this.ball };
    ballReverse.x = gameSetting.canvasWidth - this.ball.x;
    ballReverse.y = gameSetting.canvasHeight - this.ball.y;

    return { playerReverse1, playerReverse2, ballReverse };
  }
}
