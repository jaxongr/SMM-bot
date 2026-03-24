import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  controllers: [CategoriesController, ServicesController],
  providers: [CategoriesService, ServicesService],
  exports: [CategoriesService, ServicesService],
})
export class ServicesModule {}
