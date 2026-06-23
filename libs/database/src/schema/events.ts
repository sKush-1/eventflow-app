import { uuid, varchar, timestamp, pgEnum, pgTable, text, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

// Enums for events table
export const eventyTypeEnum = pgEnum('event_status', ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']);

// Events fields
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: eventyTypeEnum('status').notNull().default('DRAFT'),
    date: timestamp('date').notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    capacity: integer('capacity').notNull(),
    price: integer('price').default(0).notNull(),
    organizerId: uuid('organizer_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

