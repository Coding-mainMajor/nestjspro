import { Inject, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Paginated } from './pagination.interface';

@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public async paginationQuery<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<T>,
    where?: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<Paginated<T>> {
    const page = paginationQueryDto.page ?? 1;
    const limit = paginationQueryDto.limit ?? 10;
    const findOptions: FindManyOptions<T> = {
      skip: (page - 1) * limit,
      take: paginationQueryDto.limit,
    };
    if (where) {
      findOptions.where = where;
    }

    if (relations) {
      findOptions.relations = relations;
    }
    const result = await repository.find(findOptions);

    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.min(page, totalPages || 1);
    // const currentPage = page;
    const nextPage = currentPage === totalPages ? currentPage : currentPage + 1;
    const prevPage = currentPage === 1 ? currentPage : currentPage - 1;
    const baseUrl = `${this.request.protocol}://${this.request.headers.host}`;
    const newUrl = new URL(this.request.url, baseUrl);

    console.log(newUrl);

    const response: Paginated<T> = {
      data: result,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        currentPage: page,
        totalPages: totalPages,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        last: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        current: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${currentPage}`,
        next: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`,
        previous: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${prevPage}`,
      },
    };
    return response;
  }
}
