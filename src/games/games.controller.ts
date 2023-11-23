import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('games')
export class GamesController {
  @Post('queue')
  joinGameQueue() {}

  @Delete('queue')
  cancelGameQueue() {}

  @Post('invite/:user_id')
  inviteGame() {}

  @Post('accept/:user_id')
  acceptGameInvite() {}

  @Delete('reject/:user_id')
  rejectGameInvite() {}

  @Post('restart')
  restartGame() {}

  @Post('quit')
  quitGame() {}
}
