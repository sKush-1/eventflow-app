import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
    imports: [HttpModule],
    controllers: [EventsController],
    providers: [EventsService],
})
export class EventsModule { }