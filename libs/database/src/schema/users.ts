import { uuid, varchar, timestamp, pgEnum, pgTable } from "drizzle-orm/pg-core";

// Enums for user table
export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'ORGANIZER']);

// Users fields
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull().default('USER'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

