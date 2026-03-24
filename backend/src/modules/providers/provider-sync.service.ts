import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderApiService } from './provider-api.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProviderSyncService {
  private readonly logger = new Logger(ProviderSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerApiService: ProviderApiService,
  ) {}

  async syncProviderServices(providerId: string): Promise<{ synced: number; total: number }> {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${providerId} not found`);
    }

    this.logger.log(`Starting service sync for provider: ${provider.name} (${provider.id})`);

    const externalServices = await this.providerApiService.getServices({
      id: provider.id,
      apiUrl: provider.apiUrl,
      apiKey: provider.apiKey,
    });

    let syncedCount = 0;

    for (const extService of externalServices) {
      try {
        await this.prisma.providerService.upsert({
          where: {
            providerId_externalServiceId: {
              providerId: provider.id,
              externalServiceId: String(extService.service),
            },
          },
          update: {
            name: extService.name,
            category: extService.category,
            pricePerUnit: new Prisma.Decimal(extService.rate),
            minQuantity: parseInt(extService.min, 10),
            maxQuantity: parseInt(extService.max, 10),
            isActive: true,
          },
          create: {
            providerId: provider.id,
            externalServiceId: String(extService.service),
            name: extService.name,
            category: extService.category,
            pricePerUnit: new Prisma.Decimal(extService.rate),
            minQuantity: parseInt(extService.min, 10),
            maxQuantity: parseInt(extService.max, 10),
            isActive: true,
          },
        });
        syncedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Failed to sync service ${extService.service} (${extService.name}): ${errorMessage}`,
        );
      }
    }

    await this.prisma.provider.update({
      where: { id: providerId },
      data: { lastSyncAt: new Date() },
    });

    this.logger.log(
      `Sync completed for provider ${provider.name}: ${syncedCount}/${externalServices.length} services synced`,
    );

    return { synced: syncedCount, total: externalServices.length };
  }
}
