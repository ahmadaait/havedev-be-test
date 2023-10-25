import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    let tokenArray = req.headers.authorization;
    if (tokenArray) {
      res.locals['user'] = this.authService.decodeToken(
        tokenArray.split(' ')[1],
      ).user;
      // console.log(res.locals['user']);
    }

    return next
      .handle()
      .pipe
      // tap(() => console.log(``)),
      ();
  }
}
