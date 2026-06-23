import { CreateEventDto, UpdateEventDto } from '@app/common';
import { DatabaseService, events } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/gel-core';

@Injectable()
export class EventsServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly KafkaClient: ClientKafka,
    private readonly dbService: DatabaseService
  ) { }

  async onModuleInit() {
    //connect to kafka when module initialised
    await this.KafkaClient.connect();
  }

  private parseDate(dateStr: string): Date {
    let date = new Date(dateStr);
    if (isNaN(date.getTime()) && /^\d{8}$/.test(dateStr)) {
      const y = dateStr.substring(0, 4);
      const m = dateStr.substring(4, 6);
      const d = dateStr.substring(6, 8);
      date = new Date(`${y}-${m}-${d}`);
    }
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return date;
  }

  async create(createEventDto: CreateEventDto, organizerId: string) {
    const parsedDate = this.parseDate(createEventDto.date);

    const [event] = await this.dbService.db.insert(events).values({
      ...createEventDto,
      date: parsedDate,
      organizerId,
    }).returning()

    this.KafkaClient.emit(KAFKA_TOPICS.EVENT_CREATED, {
      eventId: event.id,
      organizerId,
      timestamp: new Date().toISOString(),
    });

  }

  async findAll() {
    return await this.dbService.db.select().from(events).where(eq(events.status, 'PUBLISHED'));
  }

  async findOne(id: string) {
    const [event] = await this.dbService.db.select().from(events).where(eq(events.id, id)).limit(1);

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    return event;
  }

  async update(id: string, userId: string, userRole: string, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id);

    if (!event) {
      throw new NotFoundException("No event found for this id!")
    }

    if (event.organizerId !== userId) {
      throw new UnauthorizedException("Unauthorized to update this resource.")
    }


    const updatedData: Record<string, unknown> = {
      ...updateEventDto
    };

    if (updateEventDto.date) {
      updatedData.date = this.parseDate(updateEventDto.date)
    }

    updatedData.updatedAt = new Date();

    const [updated] = await this.dbService.db.update(events).set(updatedData).where(eq(events.id, id)).returning();

    this.KafkaClient.emit(KAFKA_TOPICS.EVENT_UPDATED, {
      eventId: id,
      timestamp: new Date().toISOString()
    })
  }
  async publish(id: string, userId: string, userRole: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to publish this event',
      );
    }

    const [published] = await this.dbService.db
      .update(events)
      .set({ status: 'PUBLISHED', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    return published;
  }


  async cancel(id: string, userId: string, userRole: string) {
    const event = await this.findOne(id);

    if (!event) {
      throw new NotFoundException("No event found for this id!")
    }

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new UnauthorizedException("Unauthorized to update this resource.")
    }

    const [cancelled] = await this.dbService.db.update(events).set({
      status: 'CANCELLED'
    }).where(eq(events.id, id)).returning();

    this.KafkaClient.emit(KAFKA_TOPICS.EVENT_CANCELLED, {
      eventId: id,
      timestamp: new Date().toISOString()
    })

    return cancelled;
  }

  async findMyEvents(userId: string) {
    return await this.dbService.db.select().from(events).where(eq(events.organizerId, userId))
  }



}
