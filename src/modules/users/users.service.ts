import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const checkDuplicate = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (checkDuplicate) throw new HttpException('Duplicate', 500);

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create(createUserDto);

    return this.userRepository.save(user);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('c');

    queryBuilder.orderBy('c.created_at', 'DESC');
    return paginate<User>(queryBuilder, options);
  }

  async findOne(data: any): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: data,
    });
  }
}
