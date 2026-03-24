import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Support')
@ApiBearerAuth()
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a support ticket (user)' })
  createTicket(@CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List support tickets (user: own; admin: all)' })
  findAll(@CurrentUser() user: { id: string; role: string }, @Query() query: TicketQueryDto) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    return this.supportService.findAll(query, isAdmin ? undefined : user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket detail with messages' })
  findById(@Param('id') id: string) {
    return this.supportService.findById(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send message to ticket' })
  sendMessage(
    @Param('id') ticketId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: SendMessageDto,
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    return this.supportService.sendMessage(ticketId, user.id, dto, isAdmin);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update ticket status (admin only)' })
  updateStatus(@Param('id') ticketId: string, @Body('status') status: TicketStatus) {
    return this.supportService.updateStatus(ticketId, status);
  }
}
