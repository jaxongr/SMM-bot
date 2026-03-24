import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CreateMappingDto } from './dto/create-mapping.dto';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const providers = await this.prisma.provider.findMany({
      orderBy: { priority: 'desc' },
      include: {
        _count: {
          select: { orders: true, services: true, mappings: true },
        },
      },
    });

    return { data: providers };
  }

  async findById(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        services: {
          orderBy: { name: 'asc' },
        },
        mappings: {
          include: {
            service: true,
            providerService: true,
          },
          orderBy: { priority: 'desc' },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return { data: provider };
  }

  async create(dto: CreateProviderDto) {
    const provider = await this.prisma.provider.create({
      data: {
        name: dto.name,
        apiUrl: dto.apiUrl,
        apiKey: dto.apiKey,
        description: dto.description,
        priority: dto.priority ?? 0,
      },
    });

    this.logger.log(`Provider created: ${provider.name} (${provider.id})`);
    return { data: provider };
  }

  async update(id: string, dto: UpdateProviderDto) {
    const existing = await this.prisma.provider.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    const provider = await this.prisma.provider.update({
      where: { id },
      data: dto,
    });

    this.logger.log(`Provider updated: ${provider.name} (${provider.id})`);
    return { data: provider };
  }

  async deactivate(id: string) {
    const existing = await this.prisma.provider.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    const provider = await this.prisma.provider.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Provider deactivated: ${provider.name} (${provider.id})`);
    return { data: provider };
  }

  async getProviderServices(providerId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${providerId} not found`);
    }

    const services = await this.prisma.providerService.findMany({
      where: { providerId },
      orderBy: { name: 'asc' },
    });

    return { data: services };
  }

  async createMapping(dto: CreateMappingDto) {
    const [service, providerService, provider] = await Promise.all([
      this.prisma.service.findUnique({ where: { id: dto.serviceId } }),
      this.prisma.providerService.findUnique({ where: { id: dto.providerServiceId } }),
      this.prisma.provider.findUnique({ where: { id: dto.providerId } }),
    ]);

    if (!service) {
      throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
    }
    if (!providerService) {
      throw new NotFoundException(`Provider service with ID ${dto.providerServiceId} not found`);
    }
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${dto.providerId} not found`);
    }

    const existingMapping = await this.prisma.serviceProviderMapping.findUnique({
      where: {
        serviceId_providerServiceId: {
          serviceId: dto.serviceId,
          providerServiceId: dto.providerServiceId,
        },
      },
    });

    if (existingMapping) {
      throw new ConflictException('This mapping already exists');
    }

    const mapping = await this.prisma.serviceProviderMapping.create({
      data: {
        serviceId: dto.serviceId,
        providerServiceId: dto.providerServiceId,
        providerId: dto.providerId,
        priority: dto.priority ?? 0,
      },
      include: {
        service: true,
        providerService: true,
        provider: true,
      },
    });

    this.logger.log(
      `Mapping created: service=${dto.serviceId} -> provider=${dto.providerId}, providerService=${dto.providerServiceId}`,
    );
    return { data: mapping };
  }

  async deleteMapping(id: string) {
    const mapping = await this.prisma.serviceProviderMapping.findUnique({ where: { id } });
    if (!mapping) {
      throw new NotFoundException(`Mapping with ID ${id} not found`);
    }

    await this.prisma.serviceProviderMapping.delete({ where: { id } });

    this.logger.log(`Mapping deleted: ${id}`);
    return { data: { message: 'Mapping deleted successfully' } };
  }

  async getMappingsForService(serviceId: string) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const mappings = await this.prisma.serviceProviderMapping.findMany({
      where: { serviceId, isActive: true },
      include: {
        provider: true,
        providerService: true,
      },
      orderBy: { priority: 'desc' },
    });

    return { data: mappings };
  }

  async getBestProvider(serviceId: string) {
    const mapping = await this.prisma.serviceProviderMapping.findFirst({
      where: {
        serviceId,
        isActive: true,
        provider: { isActive: true },
      },
      include: {
        provider: true,
        providerService: true,
      },
      orderBy: { priority: 'desc' },
    });

    return mapping;
  }
}
