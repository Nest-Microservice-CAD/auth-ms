import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthRepository } from './repository/auth.repository';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    try {
      const user = await this.authRepository.register(dto);
      return {
        user,
        token: await this.singJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message,
      });
    }
  }

  async loginUser(dto: LoginUserDto) {
    try {
      const user = await this.authRepository.login(dto);

      return {
        user,
        token: await this.singJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
      const { sub, iat, exp, ...user } = await this.jwtService.verifyAsync(
        token,
        {
          secret: envs.jwtSecret,
        },
      );

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user: user,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        token: await this.singJWT(user),
      };
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }

  async singJWT(payload: { email: string; name: string; id: string }) {
    return await this.jwtService.signAsync(payload);
  }
}
