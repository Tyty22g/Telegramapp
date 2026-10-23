(() => {
  const tg = window.Telegram?.WebApp;
  const COUNTDOWN_SECONDS = 10;
  const CIRCUMFERENCE = 264; // 2 * PI * 42

  const $ = (id) => document.getElementById(id);
  const titleEl = $("title");
  const subtitleEl = $("subtitle");
  const countEl = $("count");
  const barEl = $("bar");
  const statusEl = $("status");
  const btn = $("go");
  const app = document.querySelector(".app");

  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("secondary_bg_color");
    tg.setBackgroundColor?.("bg_color");
  }

  function fail(message) {
    app.classList.add("error");
    titleEl.textContent = "تعذّر فتح الرابط";
    subtitleEl.textContent = "";
    statusEl.textContent = message;
    btn.hidden = true;
  }

  function openTarget(url) {
    if (tg?.openLink) tg.openLink(url);
    else window.open(url, "_blank", "noopener");
  }

  function startCountdown(url) {
    let left = COUNTDOWN_SECONDS;
    countEl.textContent = left;
    barEl.style.strokeDashoffset = 0;

    const timer = setInterval(() => {
      left -= 1;
      countEl.textContent = left;
      barEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - left / COUNTDOWN_SECONDS);

      if (left <= 0) {
        clearInterval(timer);
        titleEl.textContent = "الرابط جاهز";
        subtitleEl.textContent = "اضغط على الزر للانتقال.";
        statusEl.textContent = "تم التحضير بنجاح";
        btn.disabled = false;
        btn.textContent = "انتقل إلى الرابط";
        btn.onclick = () => openTarget(url);
      }
    }, 1000);
  }

  async function init() {
    const key =
      tg?.initDataUnsafe?.start_param ||
      new URLSearchParams(location.search).get("startapp") ||
      new URLSearchParams(location.search).get("tgWebAppStartParam");

    if (!key) return fail("لم يتم تمرير معرّف الرابط.");

    try {
      const res = await fetch("links.json", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const links = await res.json();
      const url = links[key];

      if (!url || !/^https?:\/\//i.test(url)) {
        return fail("هذا الرابط غير موجود أو منتهي الصلاحية.");
      }
      startCountdown(url);
    } catch (e) {
      fail("حدث خطأ أثناء تحميل البيانات. حاول مرة أخرى.");
    }
  }

  init();
})();
