import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportGateway } from './support.gateway';

@Module({
  imports: [JwtModule],
  controllers: [SupportController],
  providers: [SupportService, SupportGateway],
  exports: [SupportService],
})
export class SupportModule {}
