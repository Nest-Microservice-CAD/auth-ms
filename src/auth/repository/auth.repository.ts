import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from '../dto';
import * as bcript from 'bcrypt';

@Injectable()
export class AuthRepository extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthRepository.name);

  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$connect();
    this.logger.log('MongoDb connected');
  }

  async register(dto: RegisterUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const email = await this.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (email) {
      throw new Error('email already exists');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const user = await this.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: bcript.hashSync(dto.password, 10),
        },
      });
      const { password, ...userWithoutPassword } = user;
      void password;

      return userWithoutPassword;
    } catch (error) {
      this.logger.log(error);
      throw new Error('Error creating a user.');
    }
  }

  async login(dto: LoginUserDto) {
    const user = await this.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new Error('User or Password not valid');
    }

    const isPasswordValid = bcript.compareSync(dto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('User or Password not valid');
    }

    const { password, ...userWithoutPassword } = user;
    void password;

    return userWithoutPassword;
  }
}
