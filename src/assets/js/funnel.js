/* Схема пути пациента. Полосы разворачиваются один раз, когда блок попал в кадр,
   проценты досчитываются на ходу. Пружина — из Motion: полоса доезжает до места
   не линейно, а с лёгким притормаживанием в конце.

   Без JS и при «уменьшить движение» скрипт не трогает ничего: схема уже собрана
   вёрсткой и показывается целиком. Прятать нечего, ломаться нечему. */
(function () {
  var el = document.querySelector("[data-funnel]");
  if (!el) return;

  var M = window.Motion;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!M || !M.animate || reduce || !("IntersectionObserver" in window)) return;

  var animate = M.animate;
  var rows = Array.prototype.slice.call(el.querySelectorAll(".funnel__row"));

  var plan = rows.map(function (row) {
    var cur = parseFloat(row.style.getPropertyValue("--cur")) || 0;
    var prev = parseFloat(row.style.getPropertyValue("--prev")) || 0;
    return {
      kept: row.querySelector(".funnel__kept"),
      lost: row.querySelector(".funnel__lost"),
      val: row.querySelector("[data-funnel-val]"),
      cur: cur,
      lostWidth: Math.max(prev - cur, 0)
    };
  });

  // Сворачиваем только теперь, когда точно известно, что анимация будет
  plan.forEach(function (p) {
    if (p.kept) p.kept.style.width = "0%";
    if (p.lost) p.lost.style.width = "0%";
    if (p.val) p.val.textContent = "0 %";
  });

  /* Мини-сборка Motion умеет анимировать только элементы, не числа,
     поэтому счётчик крутим сами. Замедление к концу — как у полос. */
  function countUp(el, to, delay, dur) {
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = (ts - start) / 1000 - delay;
      if (t < 0) return requestAnimationFrame(step);
      var p = Math.min(t / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + " %";
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function run() {
    plan.forEach(function (p, i) {
      var delay = i * 0.1;
      var spring = { type: "spring", stiffness: 120, damping: 20, delay: delay };

      if (p.kept) animate(p.kept, { width: ["0%", p.cur + "%"] }, spring);
      if (p.lost) animate(p.lost, { width: ["0%", p.lostWidth + "%"] }, spring);

      if (p.val) countUp(p.val, p.cur, delay, 0.9);
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { run(); io.disconnect(); }
    });
  }, { threshold: 0.3 });

  io.observe(el);
})();
