import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { timeStamp } from 'console';

@Injectable()
export class AuthServiceService implements OnModuleInit {

  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  getHello(): string {
    return 'Hello world!'
  }

  async simulateUserRegisteration(email: string) {
    // publish event to kafka 
    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISERED, {
      email,
      timeStamp: new Date().toString()
    })

    return { message: `User registered: ${email}` }
  }


}
