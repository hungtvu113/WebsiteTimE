import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../modules/users/schemas/user.schema';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): UserDocument | string | undefined => {
    const request = ctx.switchToHttp().getRequest() as { user: UserDocument };
    const user = request.user;

    if (data) {
      return user?.[data as keyof UserDocument] as string;
    }
    return user;
  },
);
