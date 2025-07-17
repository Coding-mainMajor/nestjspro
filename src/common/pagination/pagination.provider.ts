import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

@Injectable()
export class PaginationProvider {
  public async paginationQuery<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<T>,
    where: FindOptionsWhere<T>,
  ) {
    const findOptions: FindManyOptions<T> = {
      skip: (paginationQueryDto.page! - 1) * paginationQueryDto.limit!,
      take: paginationQueryDto.limit,
    };
    if (where) {
      findOptions.where = where;
    }
    return await repository.find(findOptions);
  }
}
