import { gameSetting } from './games.setting';

export class Ball {
  static startSpeed = 5;
  x: number;
  y: number;
  radius: number;
  speed = Ball.startSpeed;
  dir = {
    x: 0,
    y: 0,
  };

  constructor() {
    this.x = gameSetting.canvasWidth / 2;
    this.y = gameSetting.canvasHeight / 2;
    this.radius = 20;
    this.dir.x = Math.sqrt(0.5);
    this.dir.y = Math.sqrt(0.5);
  }
}
