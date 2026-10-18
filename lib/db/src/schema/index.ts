import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  boolean,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/** A dealer (customer of the platform) with its own branded site. */
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  domain: text("domain").unique(),
  logoUrl: text("logo_url"),
  whatsapp: text("whatsapp"),
  currency: text("currency").notNull().default("USD"),
  language: text("language").notNull().default("ar"),
  /** Which Encar cars this dealer's site shows: { makes:[], yearMin, yearMax, priceMinManwon, priceMaxManwon } */
  filter: jsonb("filter").$type<{
    makes?: string[];
    yearMin?: number;
    yearMax?: number;
    priceMinManwon?: number;
    priceMaxManwon?: number;
  }>().notNull().default({}),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Encar catalog, shared by all tenants; tenants filter it. */
export const cars = pgTable(
  "cars",
  {
    id: serial("id").primaryKey(),
    encarId: text("encar_id").notNull(),
    vin: text("vin"),
    manufacturer: text("manufacturer"),
    model: text("model"),
    badge: text("badge"),
    year: integer("year"),
    mileage: integer("mileage"),
    /** Price in 만원 (10,000 KRW) as on Encar */
    priceManwon: integer("price_manwon"),
    fuel: text("fuel"),
    transmission: text("transmission"),
    color: text("color"),
    region: text("region"),
    photoUrls: jsonb("photo_urls").$type<string[]>().notNull().default([]),
    options: jsonb("options").$type<string[]>().notNull().default([]),
    /** accident history / inspection / diagnosis, raw from the actor (private fields stripped on output) */
    record: jsonb("record"),
    inspection: jsonb("inspection"),
    diagnosis: jsonb("diagnosis"),
    /** full raw item, kept for re-parsing; never exposed publicly */
    raw: jsonb("raw"),
    status: text("status").notNull().default("available"), // available | unavailable
    encarModifiedAt: timestamp("encar_modified_at"),
    lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cars_encar_id_uq").on(t.encarId),
    index("cars_vin_idx").on(t.vin),
    index("cars_search_idx").on(t.status, t.manufacturer, t.year, t.priceManwon),
  ],
);

/** Auction cars entered manually by each dealer. */
export const auctionCars = pgTable(
  "auction_cars",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    auction: text("auction").notNull(), // autobell | kcar | lotte | hub
    auctionDate: timestamp("auction_date"),
    lotNumber: text("lot_number"),
    manufacturer: text("manufacturer"),
    model: text("model"),
    year: integer("year"),
    mileage: integer("mileage"),
    startPriceManwon: bigint("start_price_manwon", { mode: "number" }),
    grade: text("grade"),
    notes: text("notes"),
    photoUrls: jsonb("photo_urls").$type<string[]>().notNull().default([]),
    status: text("status").notNull().default("available"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("auction_cars_tenant_idx").on(t.tenantId, t.status)],
);

export type Tenant = typeof tenants.$inferSelect;
export type Car = typeof cars.$inferSelect;
export type AuctionCar = typeof auctionCars.$inferSelect;
