import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async send(@Body() body: any) {
    const reply = await this.chatService.send(body.message, body.clinicId);
    return { ok: true, reply };
  }
}