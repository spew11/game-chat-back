import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const GetUser = createParamDecorator((_, ctx: ExecutionContext) => {
  console.log('GetUser() 시작');
  const request = ctx.switchToHttp().getRequest();
  if (!request.user) {
    console.log('GetUser() 유효하지 않은 유저');
    throw new UnauthorizedException('유효하지 않은 유저입니다.');
  }
  console.log('GetUSer() 종료');
  return request.user;
});
