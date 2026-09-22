/* Схема пути пациента: полосы выезжают один раз, когда блок попал в кадр.
   Это единственная непрошеная анимация на сайте — дальше движение только в ответ на действие. */
(function () {
  var el = document.querySelector("[data-funnel]");
  if (!el) return;

  function show() { el.classList.add("is-shown"); }

  if (!("IntersectionObserver" in window)) return show();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { show(); io.disconnect(); }
    });
  }, { threshold: 0.35 });

  io.observe(el);
})();
