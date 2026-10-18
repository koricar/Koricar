/**
 * Creates the catalog tables if they do not exist (same structure as lib/db/src/schema).
 * Lets a phone-only setup work without running drizzle-kit. Safe to call repeatedly.
 */
let done: Promise<void> | null = null;

export function ensureCatalogTables(): Promise<void> {
  if (!done) {
    done = (async () => {
      const { pool } = await import("@workspace/db");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id serial PRIMARY KEY,
          slug text NOT NULL UNIQUE,
          name text NOT NULL,
          domain text UNIQUE,
          logo_url text,
          whatsapp text,
          currency text NOT NULL DEFAULT 'USD',
          language text NOT NULL DEFAULT 'ar',
          filter jsonb NOT NULL DEFAULT '{}'::jsonb,
          admin_key text,
          active boolean NOT NULL DEFAULT true,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS cars (
          id serial PRIMARY KEY,
          encar_id text NOT NULL,
          vin text,
          manufacturer text,
          model text,
          badge text,
          year integer,
          mileage integer,
          price_manwon integer,
          fuel text,
          transmission text,
          color text,
          region text,
          photo_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
          options jsonb NOT NULL DEFAULT '[]'::jsonb,
          record jsonb,
          inspection jsonb,
          diagnosis jsonb,
          raw jsonb,
          status text NOT NULL DEFAULT 'available',
          encar_modified_at timestamp,
          last_synced_at timestamp NOT NULL DEFAULT now(),
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS cars_encar_id_uq ON cars (encar_id);
        CREATE INDEX IF NOT EXISTS cars_vin_idx ON cars (vin);
        CREATE INDEX IF NOT EXISTS cars_search_idx ON cars (status, manufacturer, year, price_manwon);
        CREATE TABLE IF NOT EXISTS auction_cars (
          id serial PRIMARY KEY,
          tenant_id integer NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          auction text NOT NULL,
          auction_date timestamp,
          lot_number text,
          manufacturer text,
          model text,
          year integer,
          mileage integer,
          start_price_manwon bigint,
          grade text,
          notes text,
          photo_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
          status text NOT NULL DEFAULT 'available',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS auction_cars_tenant_idx ON auction_cars (tenant_id, status);
      `);
    })().catch((e) => {
      done = null;
      throw e;
    });
  }
  return done;
}
