import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiPaginated()
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { data: user };
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return { data: user };
  }

  @Patch(':id/balance')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust user balance (add or deduct)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async adjustBalance(@Param('id') id: string, @Body() dto: AdjustBalanceDto) {
    const user = await this.usersService.adjustBalance(id, dto);
    return { data: user };
  }

  @Patch(':id/block')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle user block status' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async toggleBlock(@Param('id') id: string) {
    const user = await this.usersService.toggleBlock(id);
    return { data: user };
  }

  @Get(':id/referrals')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get user referrals list' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiPaginated()
  async getUserReferrals(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getUserReferrals(id, Number(page) || 1, Number(limit) || 20);
  }
}
