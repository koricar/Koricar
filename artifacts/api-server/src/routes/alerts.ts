import { Router } from "express";
import webpush from "web-push";
import { db } from "@workspace/db";
import {
  alertsTable,
  pushSubscriptionsTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router = Router();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:alerts@koreancar.com",
  process.env.VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? "",
);

// ─── GET /api/alerts?sessionId=xxx ───────────────────────────────────────────
router.get("/", async (req, res) => {
  const sessionId = req.query.sessionId as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: "sessionId required" });
    return;
  }
  const alerts = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.sessionId, sessionId))
    .orderBy(alertsTable.createdAt);
  res.json({ alerts });
});

// ─── POST /api/alerts ─────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const body = req.body ?? {};
  if (!body.sessionId || !body.name) {
    res.status(400).json({ error: "sessionId and name are required" });
    return;
  }
  const values = {
    sessionId: String(body.sessionId),
    name: String(body.name),
    brand: body.brand ?? null,
    model: body.model ?? null,
    yearFrom: body.yearFrom != null ? Number(body.yearFrom) : null,
    yearTo: body.yearTo != null ? Number(body.yearTo) : null,
    priceMin: body.priceMin != null ? Number(body.priceMin) : null,
    priceMax: body.priceMax != null ? Number(body.priceMax) : null,
    mileageMax: body.mileageMax != null ? Number(body.mileageMax) : null,
    fuelType: body.fuelType ?? null,
    transmission: body.transmission ?? null,
    bodyType: body.bodyType ?? null,
    color: body.color ?? null,
    sunroof: body.sunroof ?? null,
    active: true,
  };
  const [alert] = await db.insert(alertsTable).values(values).returning();
  res.status(201).json({ alert });
});

// ─── DELETE /api/alerts/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  await db.delete(alertsTable).where(eq(alertsTable.id, id));
  res.json({ success: true });
});

// ─── PATCH /api/alerts/:id/toggle ────────────────────────────────────────────
router.patch("/:id/toggle", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const [current] = await db.select().from(alertsTable).where(eq(alertsTable.id, id));
  if (!current) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const [updated] = await db
    .update(alertsTable)
    .set({ active: !current.active })
    .where(eq(alertsTable.id, id))
    .returning();
  res.json({ alert: updated });
});

// ─── POST /api/alerts/push/subscribe ─────────────────────────────────────────
router.post("/push/subscribe", async (req, res) => {
  const body = req.body ?? {};
  if (!body.sessionId || !body.endpoint || !body.p256dh || !body.auth) {
    res.status(400).json({ error: "sessionId, endpoint, p256dh, auth are required" });
    return;
  }
  const values = {
    sessionId: String(body.sessionId),
    endpoint: String(body.endpoint),
    p256dh: String(body.p256dh),
    auth: String(body.auth),
  };
  await db
    .insert(pushSubscriptionsTable)
    .values(values)
    .onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { p256dh: values.p256dh, auth: values.auth, sessionId: values.sessionId },
    });
  res.json({ success: true });
});

// ─── DELETE /api/alerts/push/subscribe ───────────────────────────────────────
router.delete("/push/subscribe", async (req, res) => {
  const endpoint = req.body?.endpoint as string | undefined;
  if (!endpoint) {
    res.status(400).json({ error: "endpoint required" });
    return;
  }
  await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, endpoint));
  res.json({ success: true });
});

// ─── GET /api/alerts/vapid-key ───────────────────────────────────────────────
router.get("/vapid-key", (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? "" });
});

// ─── Exported utility: sendPushToSession ─────────────────────────────────────
export async function sendPushToSession(sessionId: string, payload: object) {
  const subs = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.sessionId, sessionId));

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      ),
    ),
  );

  // Remove dead subscriptions
  const dead: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") dead.push(subs[i].endpoint);
  });
  if (dead.length) {
    await db.delete(pushSubscriptionsTable).where(
      inArray(pushSubscriptionsTable.endpoint, dead),
    );
  }
}

export default router;
