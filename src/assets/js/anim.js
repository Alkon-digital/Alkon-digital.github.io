/* Появление блоков при прокрутке.
   Движок — Motion (dom-mini, 5,7 КБ в gzip): пружины и WAAPI, без полного бандла.

   Главное требование: содержимое не должно остаться невидимым ни при каких условиях.
   Поэтому вместо IntersectionObserver — один обработчик прокрутки: он показывает всё,
   что оказалось выше нижней границы экрана, включая блоки, мимо которых пролетели
   рывком (переход по якорю, возврат назад, Home/End). У наблюдателя такой блок
   мог бы не поймать пересечение и остаться скрытым навсегда.

   Без JS, при «уменьшить движение» и при любой ошибке внутри — всё видно сразу. */
(function () {
  var M = window.Motion;
  if (!M || !M.animate) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var animate = M.animate;
  var EASE = [0.22, 0.61, 0.36, 1];
  var pending = [];

  function collect(selector, shift, stagger) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (group) {
      var items = group.children ? Array.prototype.slice.call(group.children) : [group];
      items.forEach(function (item, i) {
        item.style.opacity = "0";
        item.style.transform = "translateY(" + shift + "px)";
        // задержку ограничиваем: в каталоге 26 карточек в одной группе,
        // без потолка последняя выезжала бы почти через две секунды
        pending.push({ el: item, delay: Math.min(i, 7) * stagger, shift: shift });
      });
    });
  }

  function revealAll() {
    pending.forEach(function (p) {
      p.el.style.opacity = "";
      p.el.style.transform = "";
    });
    pending = [];
  }

  try {
    collect(".cards, .rows, .grid, .cat, .phero__spec, .figures", 14, 0.055);

    // Заголовки секций — поодиночке и без задержки
    Array.prototype.forEach.call(document.querySelectorAll(".section--rule h2"), function (h) {
      h.style.opacity = "0";
      h.style.transform = "translateY(10px)";
      pending.push({ el: h, delay: 0, shift: 10 });
    });
  } catch (e) {
    return revealAll();
  }

  if (!pending.length) return;

  var ticking = false;

  function check() {
    ticking = false;
    var edge = window.innerHeight * 0.92;
    var rest = [];

    pending.forEach(function (p) {
      var top = p.el.getBoundingClientRect().top;
      if (top < edge) {
        animate(
          p.el,
          { opacity: [0, 1], transform: ["translateY(" + p.shift + "px)", "translateY(0px)"] },
          { duration: 0.5, delay: p.delay, ease: EASE }
        );
      } else {
        rest.push(p);
      }
    });

    pending = rest;
    if (!pending.length) window.removeEventListener("scroll", onScroll);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(check);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  check();

  // Страховка: если что-то пошло не так, через десять секунд показываем всё
  setTimeout(revealAll, 10000);
})();
