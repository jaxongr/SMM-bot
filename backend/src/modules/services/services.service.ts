import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../../common/types/response.type';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ServiceQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.ServiceWhereInput = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.platform) {
      where.category = { platform: query.platform };
    }

    if (query.search) {
      where.OR = [
        { name: { path: ['uz'], string_contains: query.search } },
        { name: { path: ['ru'], string_contains: query.search } },
        { name: { path: ['en'], string_contains: query.search } },
      ];
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'sortOrder']: query.sortOrder || 'asc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true, platform: true },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return { data: service };
  }

  async create(dto: CreateServiceDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    const service = await this.prisma.service.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name as unknown as Record<string, string>,
        description: dto.description ? (dto.description as unknown as Record<string, string>) : undefined,
        minQuantity: dto.minQuantity,
        maxQuantity: dto.maxQuantity,
        pricePerUnit: new Prisma.Decimal(dto.pricePerUnit),
        isAutoService: dto.isAutoService ?? false,
        dripFeed: dto.dripFeed ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, platform: true },
        },
      },
    });

    this.logger.log(`Service created: ${service.id}`);
    return { data: service };
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findById(id);

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
      }
    }

    const updateData: Prisma.ServiceUpdateInput = {};

    if (dto.name) updateData.name = dto.name as unknown as Record<string, string>;
    if (dto.description !== undefined) updateData.description = dto.description as unknown as Record<string, string>;
    if (dto.categoryId) updateData.category = { connect: { id: dto.categoryId } };
    if (dto.minQuantity !== undefined) updateData.minQuantity = dto.minQuantity;
    if (dto.maxQuantity !== undefined) updateData.maxQuantity = dto.maxQuantity;
    if (dto.pricePerUnit !== undefined) updateData.pricePerUnit = new Prisma.Decimal(dto.pricePerUnit);
    if (dto.isAutoService !== undefined) updateData.isAutoService = dto.isAutoService;
    if (dto.dripFeed !== undefined) updateData.dripFeed = dto.dripFeed;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

    const service = await this.prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, slug: true, platform: true },
        },
      },
    });

    this.logger.log(`Service updated: ${id}`);
    return { data: service };
  }

  async getServicesByCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const services = await this.prisma.service.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return { data: services };
  }
}
