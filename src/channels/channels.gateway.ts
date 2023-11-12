import { UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect, WebSocketGateway,
         ConnectedSocket, SubscribeMessage, MessageBody  }from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './channels-chat.service';

interface IUser {
  id: number;
  name: string;
}

interface IChat {
  message: string;
  user: IUser;
}

interface InviteGame {
  member_id: number;
  room_id: string;
  user: IUser;
}

@WebSocketGateway(3002, {
  namespace: 'chatting',
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}

  afterInit() {}

	async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const channel_id = socket.handshake.query.channel_id as string;
    this.chatService.removeConnectedMember(channel_id, socket.data);

    socket.to(channel_id).emit('member_disconnected', { user_id: socket.data });
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const channel_id = socket.handshake.query.channel_id as string;

      await this.chatService.initChannels(channel_id);

      const user_id = socket.data;
      const tmp = await this.chatService.addConnectedMember(channel_id, user_id, socket);

      const member = {
        id: tmp.user.id,
        name: tmp.user.nickname,
      };

			// channel_id에 해당하는 방으로 입장
      await socket.join(channel_id);

			// 채널에 접속된 클라이언트에게 접속된 유저 정보 전달
      socket.to(channel_id).emit('member_join', { member });
    } catch (err) {
      socket.emit('error');
    }
  }

  @SubscribeMessage('submit_chat')
  async handleSubmitChat(@MessageBody() chat: IChat, @ConnectedSocket() socket: Socket) {
    const channel_id = socket.handshake.query.channel_id as string;
    const user_id = socket.data;

    const member = await this.chatService.getMemberInChannel(channel_id, user_id);

    if (this.chatService.isMutedMember(channel_id, user_id)) {
      socket.emit('muted');
      return;
    } else {
      this.chatService.removeMutedMember(channel_id, user_id);
    }

		// 백에서 이렇게 보낸 정보를 프론트에서 blocked된 멤버가 채팅하는 거 필터링해주기
    socket.to(channel_id).emit('new_chat', {
      message: chat.message,
      user: {
        id: member.id,
        name: member.name,
      },
    });
  }

  @SubscribeMessage('invite_game')
  async handleInviteChat(
    @MessageBody() inviteGame: InviteGame,
    @ConnectedSocket() socket: Socket,
  ) {
		// @SubscribeMessage로 프론트에서 넘어온 해당 데이터 수신
    const channel_id = socket.handshake.query.channel_id as string;
    const { member_id, room_id, user } = inviteGame;

    const member = await this.chatService.findConnectedMember(channel_id, member_id);

		// 프론트에서 socketIo.on 메소드로 앞의 인자와 동일한 값을 통해 수신
    member.socket.emit('game_invited', { room_id, user });
  }

	// SubscribeMessage로 프론트에서 socket.emit으로 넘어온 요청을 수신하고 연결된 멤버를 리턴해서 프론트로 보내고 프론트에서 채팅방에 접속한 멤버 확인
  @SubscribeMessage('get_connected_members')
  async getConnectedMembers(@ConnectedSocket() socket: Socket) {
    const channel_id = socket.handshake.query.channel_id as string;
    const connectedMembers = this.chatService.getConnectedMembers(channel_id);
    return connectedMembers;
  }

  public async kickMember(channel_id: number, user_id: number) {
    const member = this.chatService.getMemberInChannel(channel_id.toString(), user_id);
    if (member) {
      member.socket.emit('kicked');
      member.socket.disconnect();
      this.chatService.removeConnectedMember(channel_id.toString(), user_id);
    }
  }
}

