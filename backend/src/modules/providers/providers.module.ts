import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderApiService } from './provider-api.service';
import { ProviderSyncService } from './provider-sync.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, ProviderApiService, ProviderSyncService],
  exports: [ProvidersService, ProviderApiService, ProviderSyncService],
})
export class ProvidersModule {}
