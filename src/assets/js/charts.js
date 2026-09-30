/* Графики в кейсах.
   В разметке лежит обычная <table> с данными. Скрипт строит из неё SVG и прячет
   таблицу под «Показать данными». Без JS остаётся таблица — читаемая и доступная,
   а не пустая рамка. Данные всегда есть в разметке: и для поиска, и для нейросетей.

   Все графики одномерные, поэтому цвет один — акцентный. Категориальная палитра
   не нужна, а значит, и проблем с различимостью при дальтонизме здесь нет.

   Анимация — Motion (мини-сборка). Без него и при «уменьшить движение»
   график просто рисуется сразу. */
(function () {
  var M = window.Motion;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animate = M && M.animate;
  var NS = "http://www.w3.org/2000/svg";

  var W = 760, H = 300;
  var PAD = { t: 18, r: 18, b: 34, l: 52 };

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function nice(v) {
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function readTable(fig) {
    var rows = fig.querySelectorAll("tbody tr");
    var data = [];
    Array.prototype.forEach.call(rows, function (tr) {
      var x = tr.querySelector("th");
      var y = tr.querySelector("td");
      if (!x || !y) return;
      var num = parseFloat(String(y.textContent).replace(/\s| /g, "").replace(",", "."));
      if (isNaN(num)) return;
      data.push({ x: x.textContent.trim(), y: num, mark: tr.hasAttribute("data-mark") });
    });
    return data;
  }

  function axisY(svg, max, plotH, plotW) {
    var steps = 4;
    for (var i = 0; i <= steps; i++) {
      var v = (max / steps) * i;
      var y = PAD.t + plotH - (v / max) * plotH;
      svg.appendChild(el("line", {
        x1: PAD.l, x2: PAD.l + plotW, y1: y, y2: y,
        stroke: "var(--line)", "stroke-width": 1
      }));
      var t = el("text", { x: PAD.l - 10, y: y + 4, "text-anchor": "end", class: "chart__tick" });
      t.textContent = Math.round(v);
      svg.appendChild(t);
    }
  }

  function buildLine(fig, data, unit) {
    var plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
    var max = Math.max.apply(null, data.map(function (d) { return d.y; })) * 1.15;
    var stepX = plotW / (data.length - 1 || 1);

    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, class: "chart__svg", role: "img" });
    axisY(svg, max, plotH, plotW);

    var pts = data.map(function (d, i) {
      return { x: PAD.l + i * stepX, y: PAD.t + plotH - (d.y / max) * plotH, d: d };
    });

    // подписи по оси X: первая, последняя и каждая третья — иначе слипаются
    pts.forEach(function (p, i) {
      if (i !== 0 && i !== pts.length - 1 && i % 3 !== 0) return;
      var t = el("text", { x: p.x, y: H - 10, "text-anchor": "middle", class: "chart__tick" });
      t.textContent = p.d.x;
      svg.appendChild(t);
    });

    var dPath = pts.map(function (p, i) { return (i ? "L" : "M") + p.x + " " + p.y; }).join(" ");
    var dArea = dPath + " L" + pts[pts.length - 1].x + " " + (PAD.t + plotH) + " L" + pts[0].x + " " + (PAD.t + plotH) + " Z";

    var area = el("path", { d: dArea, fill: "var(--accent)", opacity: ".10" });
    svg.appendChild(area);

    var line = el("path", {
      d: dPath, fill: "none", stroke: "var(--accent)", "stroke-width": 2,
      "stroke-linejoin": "round", "stroke-linecap": "round"
    });
    svg.appendChild(line);

    // отметка начала работ
    pts.forEach(function (p) {
      if (!p.d.mark) return;
      svg.appendChild(el("line", {
        x1: p.x, x2: p.x, y1: PAD.t, y2: PAD.t + plotH,
        stroke: "var(--line-2)", "stroke-width": 1, "stroke-dasharray": "4 4"
      }));
      var lbl = el("text", { x: p.x + 6, y: PAD.t + 12, class: "chart__mark" });
      lbl.textContent = fig.getAttribute("data-mark") || "начало работ";
      svg.appendChild(lbl);
    });

    pts.forEach(function (p) {
      svg.appendChild(el("circle", { cx: p.x, cy: p.y, r: 4, fill: "var(--bg)", stroke: "var(--accent)", "stroke-width": 2 }));
    });

    fig.querySelector("[data-chart-canvas]").appendChild(svg);
    hover(fig, svg, pts, plotH, unit);

    if (animate && !reduce) {
      var len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      area.style.opacity = "0";
      var dots = svg.querySelectorAll("circle");
      Array.prototype.forEach.call(dots, function (c) { c.style.opacity = "0"; });
      onView(fig, function () {
        animate(line, { strokeDashoffset: [len, 0] }, { duration: 1.1, ease: [0.4, 0, 0.2, 1] });
        animate(area, { opacity: [0, 0.1] }, { duration: 0.8, delay: 0.5 });
        Array.prototype.forEach.call(dots, function (c, i) {
          animate(c, { opacity: [0, 1] }, { duration: 0.25, delay: 0.5 + i * (0.6 / dots.length) });
        });
      });
    }
  }

  function buildBars(fig, data, unit) {
    var rowH = 38, gap = 10;
    var h = data.length * (rowH + gap) + 10;
    var labelW = 210, valueW = 74;
    var plotW = W - labelW - valueW;
    var max = Math.max.apply(null, data.map(function (d) { return d.y; }));

    var svg = el("svg", { viewBox: "0 0 " + W + " " + h, class: "chart__svg", role: "img" });

    data.forEach(function (d, i) {
      var y = i * (rowH + gap);
      var lbl = el("text", { x: 0, y: y + rowH / 2 + 5, class: "chart__cat" });
      lbl.textContent = d.x;
      svg.appendChild(lbl);

      svg.appendChild(el("rect", {
        x: labelW, y: y + 6, width: plotW, height: rowH - 12, rx: 4, fill: "var(--bg-3)"
      }));

      var w = Math.max((d.y / max) * plotW, 3);
      var bar = el("rect", {
        x: labelW, y: y + 6, width: w, height: rowH - 12, rx: 4,
        fill: "var(--accent)", class: "chart__bar"
      });
      svg.appendChild(bar);

      var val = el("text", { x: W, y: y + rowH / 2 + 5, "text-anchor": "end", class: "chart__val" });
      val.textContent = nice(d.y) + (unit ? " " + unit : "");
      svg.appendChild(val);

      if (animate && !reduce) {
        bar.setAttribute("width", 0);
        val.style.opacity = "0";
        bar.__to = w;
      }
    });

    fig.querySelector("[data-chart-canvas]").appendChild(svg);

    if (animate && !reduce) {
      onView(fig, function () {
        var bars = svg.querySelectorAll(".chart__bar");
        var vals = svg.querySelectorAll(".chart__val");
        Array.prototype.forEach.call(bars, function (b, i) {
          animate(b, { width: [0, b.__to] }, { duration: 0.75, delay: i * 0.08, ease: [0.22, 0.61, 0.36, 1] });
          animate(vals[i], { opacity: [0, 1] }, { duration: 0.3, delay: 0.35 + i * 0.08 });
        });
      });
    }
  }

  /* Наведение: вертикаль и подпись значения. */
  function hover(fig, svg, pts, plotH, unit) {
    var cross = el("line", {
      y1: PAD.t, y2: PAD.t + plotH, stroke: "var(--line-2)", "stroke-width": 1, opacity: 0
    });
    svg.appendChild(cross);
    var tip = document.createElement("div");
    tip.className = "chart__tip";
    tip.hidden = true;
    fig.querySelector("[data-chart-canvas]").appendChild(tip);

    svg.addEventListener("pointermove", function (e) {
      var box = svg.getBoundingClientRect();
      var x = ((e.clientX - box.left) / box.width) * W;
      var best = null, bd = 1e9;
      pts.forEach(function (p) {
        var d = Math.abs(p.x - x);
        if (d < bd) { bd = d; best = p; }
      });
      if (!best) return;
      cross.setAttribute("x1", best.x);
      cross.setAttribute("x2", best.x);
      cross.setAttribute("opacity", 1);
      tip.hidden = false;
      tip.textContent = best.d.x + ": " + nice(best.d.y) + (unit ? " " + unit : "");
      tip.style.left = (best.x / W) * 100 + "%";
      tip.style.top = (best.y / H) * 100 + "%";
    });
    svg.addEventListener("pointerleave", function () {
      cross.setAttribute("opacity", 0);
      tip.hidden = true;
    });
  }

  function onView(node, cb) {
    if (!("IntersectionObserver" in window)) return cb();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cb(); io.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(node);
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-chart]"), function (fig) {
    var data = readTable(fig);
    if (!data.length) return;
    var unit = fig.getAttribute("data-unit") || "";
    try {
      if (fig.getAttribute("data-chart") === "bars") buildBars(fig, data, unit);
      else buildLine(fig, data, unit);
    } catch (err) {
      return; // таблица остаётся на месте — читать всё равно можно
    }
    // таблицу прячем только после того, как график действительно построился
    var tbl = fig.querySelector("table");
    if (!tbl) return;
    var det = document.createElement("details");
    det.className = "chart__table";
    var sum = document.createElement("summary");
    sum.textContent = "Показать данными";
    det.appendChild(sum);
    tbl.parentNode.insertBefore(det, tbl);
    det.appendChild(tbl);
  });
})();
