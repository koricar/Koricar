export const ADMIN_PAGE_HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>إعداد الكتالوج</title>
<style>
  :root { --bg:#0f1115; --card:#181b22; --line:#2a2f3a; --text:#eef0f4; --mute:#9aa3b2; --acc:#4f8cff; --ok:#2fbf71; --err:#ff5d5d; }
  @media (prefers-color-scheme: light) { :root { --bg:#f5f6f8; --card:#fff; --line:#dde1e8; --text:#161a22; --mute:#5b6473; } }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:16px/1.6 system-ui,"Segoe UI",Tahoma,sans-serif; padding:16px; }
  main { max-width:560px; margin:0 auto; display:grid; gap:14px; }
  h1 { font-size:20px; margin:4px 0 0; }
  section { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:14px; display:grid; gap:10px; }
  h2 { font-size:16px; margin:0; }
  label { font-size:13px; color:var(--mute); display:grid; gap:4px; }
  input { width:100%; padding:11px 12px; border-radius:8px; border:1px solid var(--line); background:transparent; color:var(--text); font:inherit; }
  .row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  button { padding:12px; border:0; border-radius:8px; background:var(--acc); color:#fff; font:inherit; font-weight:600; }
  button:disabled { opacity:.5; }
  pre { margin:0; white-space:pre-wrap; word-break:break-word; direction:ltr; text-align:left; font-size:13px; background:rgba(127,127,127,.12); padding:10px; border-radius:8px; }
  .ok { color:var(--ok); } .err { color:var(--err); }
  small { color:var(--mute); }
</style>
</head>
<body>
<main>
  <h1>إعداد الكتالوج</h1>

  <section>
    <h2>1) كلمة الدخول</h2>
    <label>ADMIN_TOKEN (القيمة اللي حطيتها في Render)
      <input id="token" type="password" autocomplete="off" placeholder="••••••••">
    </label>
    <button id="check">فحص الاتصال</button>
    <pre id="stats">—</pre>
  </section>

  <section>
    <h2>2) إنشاء تاجر</h2>
    <div class="row">
      <label>المعرّف (إنجليزي)<input id="slug" value="dealer1" dir="ltr"></label>
      <label>اسم التاجر<input id="name" placeholder="اسم التاجر"></label>
    </div>
    <label>الماركات (كوري، مفصولة بفاصلة)<input id="makes" value="현대" dir="ltr"></label>
    <div class="row">
      <label>سنة من<input id="yearMin" type="number" inputmode="numeric" value="2016"></label>
      <label>سنة إلى<input id="yearMax" type="number" inputmode="numeric"></label>
    </div>
    <div class="row">
      <label>سعر من (만원)<input id="priceMin" type="number" inputmode="numeric"></label>
      <label>سعر إلى (만원)<input id="priceMax" type="number" inputmode="numeric"></label>
    </div>
    <label>واتساب<input id="whatsapp" dir="ltr" placeholder="+82..."></label>
    <button id="mkTenant">حفظ التاجر</button>
    <pre id="tenantOut">—</pre>
  </section>

  <section>
    <h2>3) رفع ملف السيارات (JSON من Apify)</h2>
    <input id="file" type="file" accept=".json,application/json">
    <label style="display:flex;gap:8px;align-items:center"><input id="mark" type="checkbox" style="width:auto"> اعتبر السيارات غير الموجودة في الملف غير متاحة <small>(فقط إذا الملف سحب كامل)</small></label>
    <button id="upload">رفع واستيراد</button>
    <pre id="importOut">—</pre>
  </section>
</main>
<script>
const $ = (id) => document.getElementById(id);
async function api(path, opts = {}) {
  const res = await fetch('/api/admin' + path, {
    ...opts,
    headers: { 'content-type': 'application/json', 'x-admin-token': $('token').value.trim() },
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
  return { ok: res.ok, status: res.status, data };
}
function show(el, r) {
  el.className = r.ok ? 'ok' : 'err';
  el.textContent = (r.ok ? '' : 'خطأ ' + r.status + '\\n') + JSON.stringify(r.data, null, 2);
}
$('check').onclick = async () => { $('check').disabled = true; try { show($('stats'), await api('/stats')); } catch (e) { $('stats').textContent = String(e); } $('check').disabled = false; };
$('mkTenant').onclick = async () => {
  const body = {}; for (const k of ['slug','name','makes','yearMin','yearMax','priceMin','priceMax','whatsapp']) body[k] = $(k).value;
  $('mkTenant').disabled = true;
  try { show($('tenantOut'), await api('/tenant', { method: 'POST', body: JSON.stringify(body) })); } catch (e) { $('tenantOut').textContent = String(e); }
  $('mkTenant').disabled = false;
};
$('upload').onclick = async () => {
  const f = $('file').files[0];
  if (!f) { $('importOut').textContent = 'اختر ملف أولًا'; return; }
  $('upload').disabled = true; $('importOut').className = ''; $('importOut').textContent = 'جاري الرفع...';
  try {
    const items = JSON.parse(await f.text());
    show($('importOut'), await api('/import', { method: 'POST', body: JSON.stringify({ items, markMissing: $('mark').checked }) }));
  } catch (e) { $('importOut').className = 'err'; $('importOut').textContent = String(e); }
  $('upload').disabled = false;
};
</script>
</body>
</html>`;
