import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  model: text("model"),
  yearFrom: integer("year_from"),
  yearTo: integer("year_to"),
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  mileageMax: integer("mileage_max"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  bodyType: text("body_type"),
  color: text("color"),
  sunroof: boolean("sunroof"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastCheckedAt: timestamp("last_checked_at"),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true, createdAt: true, lastCheckedAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;

// ── Seen Cars (per alert) ─────────────────────────────────────────────────────
export const alertSeenCarsTable = pgTable("alert_seen_cars", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").notNull().references(() => alertsTable.id, { onDelete: "cascade" }),
  carId: text("car_id").notNull(),
  seenAt: timestamp("seen_at").notNull().defaultNow(),
});

// ── Push Subscriptions ────────────────────────────────────────────────────────
export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptionsTable).omit({ id: true, createdAt: true });
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect;
