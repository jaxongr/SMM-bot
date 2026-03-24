import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginated() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' }),
  );
}
