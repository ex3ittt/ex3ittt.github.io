const GH = 'https://github.com/ex3ittt'

export interface Project {
  name: string
  repo?: string
  demo?: string
  what: string
  detail: string
  stack: string
  /** The project's own main colour — a strip next to its picture. */
  colour: string
  shot?: { src: string; alt: string }
  terminal?: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Чат с PDF',
    repo: `${GH}/offline-pdf-chat`,
    what: 'Вопросы к своим PDF без интернета — модель работает на компьютере.',
    detail: 'Гибридный поиск (векторы + BM25), ответы со ссылками на страницы, маркером выделены те предложения, откуда взят ответ.',
    stack: 'Python, FastAPI, numpy, Ollama',
    colour: '#c3d63a',
    shot: { src: '/shots/pdf-chat.jpg', alt: 'Ответ со ссылками на страницы и цитатами под маркером' },
  },
  {
    name: 'Кроха',
    repo: `${GH}/kroha-lang`,
    demo: 'https://ex3ittt.github.io/kroha-lang/',
    what: 'Маленький язык программирования с русскими словами и песочница в браузере.',
    detail: 'Лексер, парсер Пратта и интерпретатор с нуля. Ошибки показывают строку, столбец и подсказку, что исправить.',
    stack: 'TypeScript, Vite',
    colour: '#284034',
    shot: { src: '/shots/kroha.jpg', alt: 'Школьная доска с кодом на Крохе и лист с выводом программы' },
  },
  {
    name: 'Короткие ссылки',
    repo: `${GH}/link-shortener`,
    what: 'Сервис коротких ссылок со статистикой переходов.',
    detail: 'Redis на горячем пути, клики пишутся после ответа, превью мессенджеров не считаются людьми. Тесты на SQLite и на настоящих PostgreSQL и Redis в CI.',
    stack: 'Python, FastAPI, PostgreSQL, Redis, Docker',
    colour: '#1f3fd1',
    shot: { src: '/shots/link-shortener.jpg', alt: 'Кобальтовый экран с только что сокращённой ссылкой' },
  },
  {
    name: 'Комната для группы',
    repo: `${GH}/study-chat`,
    what: 'Чат в реальном времени для учебной группы, комната по ссылке.',
    detail: 'Очередь отправки на случай обрыва связи, переподключение с паузой, дедупликация по clientId. Переписка свёрстана как текст пьесы.',
    stack: 'Node.js, WebSocket, SQLite',
    colour: '#8c2346',
    shot: { src: '/shots/study-chat.jpg', alt: 'Переписка в виде пьесы с ремарками «Входит Даня» и «Даня печатает»' },
  },
  {
    name: 'Поиск пути',
    repo: `${GH}/pathfinding-visualizer`,
    demo: 'https://ex3ittt.github.io/pathfinding-visualizer/',
    what: 'A*, Дейкстра, поиск в ширину и глубину — пошагово на карте ориентирования.',
    detail: 'Три алгоритма — одна функция с разными весами. Лабиринты, болота с ценой шага, сравнение всех алгоритмов на одной карте.',
    stack: 'TypeScript, Canvas',
    colour: '#b0247f',
    shot: { src: '/shots/pathfinding.jpg', alt: 'Лабиринт в стиле карты ориентирования с фиолетовым маршрутом' },
  },
  {
    name: 'Кто кому должен',
    repo: `${GH}/trip-split`,
    demo: 'https://ex3ittt.github.io/trip-split/',
    what: 'Делит общие траты в поездке и считает переводы.',
    detail: 'Минимальное число переводов через динамику по подмножествам, деньги в копейках, поездка целиком помещается в ссылку.',
    stack: 'React, TypeScript',
    colour: '#1b2a41',
    shot: { src: '/shots/trip-split.jpg', alt: 'Траты поездки и расчёт в виде кассового чека' },
  },
  {
    name: 'Лента',
    repo: `${GH}/typing-tape`,
    demo: 'https://ex3ittt.github.io/typing-tape/',
    what: 'Тренажёр слепой печати на русской раскладке.',
    detail: '16 уроков из настоящих слов, подсказка пальца, карта ошибок на клавиатуре после урока.',
    stack: 'TypeScript, Vite',
    colour: '#ffd166',
    shot: { src: '/shots/typing-tape.jpg', alt: 'Лента с текстом и клавиатура с подсвеченными ошибками' },
  },
  {
    name: 'Тихий час',
    repo: `${GH}/quiet-hour`,
    what: 'Расширение Chrome: таймер фокуса, отвлекающие сайты закрыты.',
    detail: 'declarativeNetRequest вместо перехвата запросов, будильники вместо таймеров — service worker в Manifest V3 может уснуть в любой момент.',
    stack: 'JavaScript, Chrome Manifest V3',
    colour: '#e39a2d',
    shot: { src: '/shots/quiet-hour.jpg', alt: 'Страница «vk.com подождёт» с отсчётом до конца тихого часа' },
  },
  {
    name: 'deadlink',
    repo: `${GH}/deadlink`,
    what: 'Находит битые ссылки на сайте и группирует их по страницам.',
    detail: 'Параллельный обход с семафором, ограничение частоты на хост, robots.txt, HEAD с откатом на GET. Код выхода 1 — для CI.',
    stack: 'Go',
    colour: '#00add8',
    terminal: `$ deadlink http://localhost:8090
Проверено 10 ссылок на 5 страницах за 2s.
Битых: 5.

http://localhost:8090/news/
  404   http://localhost:8090/news/2025-olympiad.html  «Олимпиада 2025»

http://localhost:8090/schedule.html
  404   http://localhost:8090/css/print.css  «стили или иконка»
  404   http://localhost:8090/schedule-autumn.xlsx  «Скачать расписание»`,
  },
  {
    name: 'Бот дедлайнов',
    repo: `${GH}/deadline-bot`,
    what: 'Телеграм-бот: пишешь дедлайн обычными словами — он напоминает заранее.',
    detail: '«лаба до 25.10 18:00», «курсач через 2 недели», «в пятницу к 9 утра». Напоминания переживают перезапуск, пропущенные схлопываются в одно.',
    stack: 'Python, aiogram 3, SQLite',
    colour: '#2aabee',
    terminal: `> в пятницу к 9 утра коллоквиум
Записал: Коллоквиум
пт, 23 октября, 09:00 — послезавтра.
Напомню за день и за 3 часа.

> /list
На этой неделе
1. Коллоквиум — пт, 23 октября, 09:00, послезавтра
2. Лаба 3 по физике — вс, 25 октября, 18:00, через 4 дня`,
  },
]
