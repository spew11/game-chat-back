export enum RedisKey {
  SOCKET_TO_USER = 'socketToUser',
  USER_TO_SOCKET = 'userToSocket',
  USER_STATUS = 'userStatus',
  USER_TO_SESSION = 'userToSession',
}

export enum RedisFieldPrefix {
  SOCKET_ID = 'socket_id:',
  USER_ID = 'user_id:',
  SESSION_ID = 'session_id:',
}
