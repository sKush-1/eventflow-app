import { DatabaseService, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { ConflictException, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt'
import { timestamp } from 'drizzle-orm/gel-core';

@Injectable()
export class AuthServiceService implements OnModuleInit {

  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async register(email: string, password: string, name: string) {

    const existingUser = await this.dbService.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new ConflictException('User already exists')
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.dbService.db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // send user registered event 
    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user[0].id,
      email: user[0].email,
      name: user[0].name,
      createdAt: user[0].createdAt
    })

    return { message: 'User registered successfully', userId: user[0].id };

  }


  async login(email: string, password: string) {
    const [user] = await this.dbService.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGIN, {
      userId: user.id,
      timestamp: new Date().toISOString()
    })


    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }

  }

  async getProfile(userId: string) {
    const [user] = await this.dbService.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }





}
