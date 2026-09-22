/* Сбор анамнеза на главной. Без зависимостей.
   Ответы никуда не отправляются — это разбор для самого посетителя.
   TODO: на последнем шаге подключить форму (Яндекс Формы или свой обработчик
   на российском хостинге — требование 152-ФЗ). */
(function () {
  var root = document.querySelector("[data-intake]");
  if (!root) return;

  var body = root.querySelector("[data-intake-body]");
  var counter = root.querySelector("[data-intake-count]");

  var questions = [
    {
      q: "Сколько записавшихся пациентов не доходит до приёма?",
      options: [
        { text: "Знаем точную цифру", weak: false },
        { text: "Примерно представляем", weak: true },
        { text: "Не считаем", weak: true }
      ]
    },
    {
      q: "Что происходит с заявкой с сайта?",
      options: [
        { text: "Администратор перезванивает в течение 15 минут", weak: false },
        { text: "Перезваниваем в течение дня", weak: true },
        { text: "Как получится — зависит от загрузки", weak: true }
      ]
    },
    {
      q: "Откуда пришли пациенты, записавшиеся в этом месяце?",
      options: [
        { text: "Видим по каждому каналу отдельно", weak: false },
        { text: "Знаем только общее число обращений", weak: true },
        { text: "Не отслеживаем", weak: true }
      ]
    },
    {
      q: "Что видит пациент, который ищет вашу услугу в Яндексе?",
      options: [
        { text: "Мы в первой пятёрке", weak: false },
        { text: "Мы где-то на второй странице", weak: true },
        { text: "Не проверяли", weak: true }
      ]
    }
  ];

  var step = 0;
  var weak = 0;

  var findings = [
    {
      limit: 0,
      title: "Учёт поставлен лучше, чем у большинства клиник.",
      text: "Значит, точки роста стоит искать не в отчётности, а в самой выдаче и в конверсии сайта. Это тоже разбирается — просто с другого конца."
    },
    {
      limit: 2,
      title: "Часть пути пациента у вас не просматривается.",
      text: "Обычно деньги теряются именно там, где никто не смотрит: между заявкой и звонком администратора, между звонком и явкой."
    },
    {
      limit: 4,
      title: "Путь пациента не просматривается почти целиком.",
      text: "Пока не видно, на каком шаге уходят люди, любой рекламный бюджет — это ставка вслепую. Начинать надо не с рекламы, а с измерений."
    }
  ];

  function render() {
    if (step >= questions.length) return renderResult();

    var item = questions[step];
    counter.textContent = "Вопрос " + (step + 1) + " из " + questions.length;

    var list = document.createElement("ul");
    list.className = "intake__options";

    item.options.forEach(function (opt) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "intake__opt";
      btn.textContent = opt.text;
      btn.addEventListener("click", function () {
        if (opt.weak) weak++;
        step++;
        render();
      });
      li.appendChild(btn);
      list.appendChild(li);
    });

    body.textContent = "";
    var title = document.createElement("p");
    title.className = "intake__q";
    title.textContent = item.q;
    body.appendChild(title);
    body.appendChild(list);
    title.setAttribute("tabindex", "-1");
    // preventScroll: иначе браузер утаскивает страницу к фокусу и экран прыгает
    if (step > 0) title.focus({ preventScroll: true });
  }

  function renderResult() {
    var found = findings.find(function (f) { return weak <= f.limit; }) || findings[findings.length - 1];
    counter.textContent = "Предварительный вывод";

    body.textContent = "";
    var box = document.createElement("div");
    box.className = "intake__result";
    box.innerHTML =
      '<div class="intake__finding"><strong>' + found.title + "</strong></div>" +
      "<p>" + found.text + "</p>" +
      '<p>Это только предварительный вывод по четырём вопросам. Полный разбор занимает несколько дней и опирается на вашу аналитику.</p>' +
      '<a class="btn" href="/kontakty/">Собрать полный анамнез</a> ' +
      '<button type="button" class="btn btn--quiet" data-intake-restart>Пройти заново</button>';
    body.appendChild(box);

    box.querySelector("[data-intake-restart]").addEventListener("click", function () {
      step = 0; weak = 0; render();
    });
  }

  render();
})();
