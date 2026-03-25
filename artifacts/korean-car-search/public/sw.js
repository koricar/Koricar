self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "تنبيه سيارة جديدة", body: event.data.text() };
  }

  const { title, body, url, cars = [], alertId } = data;

  const options = {
    body: body || "",
    icon: "/icon-192.png",
    badge: "/icon-96.png",
    tag: `alert-${alertId ?? "new"}`,
    renotify: true,
    requireInteraction: true,
    dir: "rtl",
    lang: "ar",
    data: { url: url || "/", cars },
    actions: [
      { action: "open", title: "عرض السيارة" },
      { action: "dismiss", title: "تجاهل" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
