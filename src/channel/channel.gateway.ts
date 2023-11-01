import { UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect, WebSocketGateway,
         ConnectedSocket, SubscribeMessage, MessageBody  }from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './services/channel-chat.service';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';

  interface IUser {
	id: number;
	name: string;
  }

  interface inviteGame {
	member_id: number;
	room_id: string;
	user: IUser;
  }

@WebSocketGateway(3002, {
  namespace: 'chatting',
	cors: {
	  origin: ['http://localhost:3000','http://127.0.0.1:3000',
              process.env.FRONTEND_URL
	  ],
	  credentials: true,
	},
  })

export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit {
  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}
  afterInit() { }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.query.token as string;
    const channel_id = socket.handshake.query.channel_id as string;
    const payload = await this.jwtService.verifyAsync(token);
    this.chatService.removeConnectedMember(channel_id, payload.sub);

    socket.to(channel_id).emit('member_disconnected', { user_id: payload.sub });
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const token = socket.handshake.query.token as string;
      const channel_id = socket.handshake.query.channel_id as string;
      const payload: any = await this.jwtService.verifyAsync(token);

      await this.chatService.initChannels(channel_id);

      const tmp = await this.chatService.addConnectedMember(
        channel_id,
        payload.sub,
        socket,
      );

      const member = {
        id: tmp.user.id,
        name: tmp.user.nickname,
      };

      await socket.join(channel_id); // channel_id에 해당하는 방으로 입장

      socket.to(channel_id).emit('member_join', { member });
      // 채널에 접속된 클라이언트에게 접속된 유저 정보 전달
    } catch (err) {
      socket.emit('error');
    }
  }
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('submit_chat')
  async handleSubmitChat(@ConnectedSocket() socket: Socket) {
    const channel_id = socket.handshake.query.channel_id as string;
    const user_id  = socket.data;

    const member = await this.chatService.getMemberInChannel(channel_id, user_id);

    if (this.chatService.isMutedMember(channel_id, user_id)) {
      socket.emit('muted');
      return;
    } else {
      this.chatService.removeMutedMember(channel_id, user_id);
    }

    // 백에서 이렇게 보낸 정보를 프론트에서 blocked된 멤버가 채팅하는 거 필터링해주기
    socket.to(channel_id).emit('new_chat', {
      user: {
        id: member.id,
        name: member.name,
      },
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('invite_game')
  async handleInviteChat(
    @MessageBody() inviteGame: inviteGame,
    @ConnectedSocket() socket: Socket,
  ) {
    const channel_id = socket.handshake.query.channel_id as string;
    const { member_id, room_id, user } = inviteGame;
    // @SubscribeMessage로 프론트에서 넘어온 해당 데이터 수신

    const member = await this.chatService.findConnectedMember(
      channel_id,
      member_id,
    );

    member.socket.emit('game_invited', { room_id, user });
    // 프론트에서 socketIo.on 메소드로 앞의 인자와 동일한 값을 통해 수신
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('get_connected_members')
  async getConnectedMembers(@ConnectedSocket() socket: Socket) {
    const channel_id = socket.handshake.query.channel_id as string;
    const connectedMembers = this.chatService.getConnectedMembers(channel_id);
    return connectedMembers;
  }
  // SubscribeMessage로 프론트에서 socket.emit으로 넘어온 요청 수신해서 연결된 멤버 리턴해서 프론트로 보내고 프론트에서 채팅방에 접속한 멤버 확인

  public async kickMember(channel_id: number, user_id: number) {
    const member = this.chatService.getMemberInChannel(
      channel_id.toString(),
      user_id,
    );
    if (member) {
      member.socket.emit('kicked');
      member.socket.disconnect();
      this.chatService.removeConnectedMember(channel_id.toString(), user_id);
    }
  }
}

