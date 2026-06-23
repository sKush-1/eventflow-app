import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { EventsServiceService } from './events-service.service';
import { CreateEventDto, UpdateEventDto } from '@app/common';

@Controller()
export class EventsServiceController {
  constructor(private readonly eventsServiceService: EventsServiceService) { }

  @Post()
  create(@Body() createEventDto: CreateEventDto, @Headers('x-user-id') userId: string) {
    return this.eventsServiceService.create(createEventDto, userId)
  }

  @Get()
  findAll() {
    return this.eventsServiceService.findAll();
  }

  @Get('my-events')
  findMyEvents(@Headers('x-user-id') userId: string) {
    return this.eventsServiceService.findMyEvents(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsServiceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateEventDto: UpdateEventDto, @Headers('x-user-id') userId: string, @Headers('x-user-role') userRole: string) {
    return this.eventsServiceService.update(id, userId, userRole, updateEventDto);
  }

  @Put(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @Headers('x-user-id') userId: string, @Headers('x-user-role') userRole: string,) {
    return this.eventsServiceService.cancel(id, userId, userRole);
  }

}
