import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (!request.user) {
            throw new UnauthorizedException('유효하지 않은 유저입니다.');
        }
        return request.user;
    },
);