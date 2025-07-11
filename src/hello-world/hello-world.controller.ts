import { Controller, Get } from '@nestjs/common';
import { HelloWorldService } from './hello-world.service';

@Controller('welcome')
export class HelloWorldController {
  constructor(private readonly service: HelloWorldService) {}

  @Get('message')
  fetchWelcome(): string {
    return this.service.getWelcomeMessage();
  }
}
