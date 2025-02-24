//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { OwnerLoginService } from 'src/owner/service/owner.login.service';

//* JWT 토큰을 이용한 전략 구현
@Injectable()
export class OwnerJwtStrategy extends PassportStrategy(Strategy, 'ownerJwt') {
  constructor(
    private readonly ownerLoginService: OwnerLoginService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { userId: number; type: string }) {
    console.log('JWT Validate Payload:', payload);
    //* 타입이 'Owner'가 아니라면 인증 에러 발생
    if (payload.type !== 'Owner') {
      throw new UnauthorizedException();
    }
    const owner = await this.ownerLoginService.findOne(payload.userId);
    if (!owner) {
      throw new UnauthorizedException();
    }
    return owner;
  }
}
