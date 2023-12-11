import { gameSetting } from './games.setting';

class Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  speed = 4;
  dir = {
    x: 0,
    y: 0,
  };

  constructor(role: 'P1' | 'P2') {
    if (role === 'P1') {
      this.x = gameSetting.canvasWidth / 2 - gameSetting.paddleWidth / 2;
      this.y = gameSetting.canvasHeight - gameSetting.paddleHeight;
      this.width = gameSetting.paddleWidth;
      this.height = gameSetting.paddleHeight;
    } else {
      this.x = gameSetting.canvasWidth / 2 - gameSetting.paddleWidth / 2;
      this.y = 0;
      this.width = gameSetting.paddleWidth;
      this.height = gameSetting.paddleHeight;
    }
  }
}

export class Player {
  bar: Bar;
  socketId: string;
  userId: number;
  score = 0;
  constructor(private role: 'P1' | 'P2') {
    this.bar = new Bar(role);
  }

  moveRight() {
    this.role === 'P1' ? (this.bar.dir.x = +1) : (this.bar.dir.x = -1);
  }
  moveLeft() {
    this.role === 'P1' ? (this.bar.dir.x = -1) : (this.bar.dir.x = +1);
  }
  moveStop() {
    this.bar.dir.x = 0;
  }
}
