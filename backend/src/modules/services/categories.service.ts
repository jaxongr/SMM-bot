import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(platform?: Platform) {
    const where: Record<string, unknown> = { isActive: true };

    if (platform) {
      where.platform = platform;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    return { data: categories };
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return { data: category };
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name as unknown as Record<string, string>,
        slug: dto.slug,
        platform: dto.platform,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    this.logger.log(`Category created: ${category.id} (${dto.slug})`);
    return { data: category };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    if (dto.slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });

      if (existing) {
        throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name as unknown as Record<string, string> }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.platform && { platform: dto.platform }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    this.logger.log(`Category updated: ${id}`);
    return { data: category };
  }

  async deactivate(id: string) {
    await this.findById(id);

    const category = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Category deactivated: ${id}`);
    return { data: category };
  }
}
