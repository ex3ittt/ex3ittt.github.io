const GH = 'https://github.com/ex3ittt'

export interface Project {
  name: string
  repo?: string
  demo?: string
  what: string
  detail: string
  stack: string
  /** Languages for the filter. */
  langs: string[]
  /** Anchor on the page. */
  slug: string
  /** The project's own main colour — a strip next to its picture. */
  colour: string
  shot?: { src: string; alt: string }
  terminal?: string
}

export const PROJECTS: Project[] = [
  {
    name: 'До стипендии',
    slug: 'do-stipendii',
    langs: ['Dart'],
    repo: `${GH}/do-stipendii`,
    demo: 'https://ex3ittt.github.io/do-stipendii/',
    what: 'Приложение для iPhone: сколько можно потратить сегодня, чтобы деньги дожили до стипендии.',
    detail: 'Делит деньги по дням и пересчитывает лимит после каждой траты. Лента дней показывает, где уложился, а где был перерасход.',
    stack: 'Flutter, Dart',
    colour: '#1f6f64',
    shot: { src: '/shots/do-stipendii.jpg', alt: 'Три экрана приложения: первый запуск, лимит на сегодня с лентой дней и ввод траты' },
  },
  {
    name: 'Чат с PDF',
    slug: 'pdf-chat',
    langs: ['Python'],
    repo: `${GH}/offline-pdf-chat`,
    what: 'Задаёшь вопрос по своим PDF, отвечает модель прямо на компьютере. Интернет не нужен.',
    detail: 'Нужные куски текста ищутся и по смыслу, и по словам. В ответе стоят номера страниц, а в цитате подсвечено предложение, откуда он взят.',
    stack: 'Python, FastAPI, numpy, Ollama',
    colour: '#c3d63a',
    shot: { src: '/shots/pdf-chat.jpg', alt: 'Ответ со ссылками на страницы и цитатами под маркером' },
  },
  {
    name: 'Кроха',
    slug: 'kroha',
    langs: ['TypeScript'],
    repo: `${GH}/kroha-lang`,
    demo: 'https://ex3ittt.github.io/kroha-lang/',
    what: 'Мой язык программирования с русскими словами. Код можно писать прямо в браузере.',
    detail: 'Лексер, парсер и интерпретатор написаны с нуля. Ошибки выводятся по-русски, с номером строки и подсказкой, что поправить.',
    stack: 'TypeScript, Vite',
    colour: '#284034',
    shot: { src: '/shots/kroha.jpg', alt: 'Школьная доска с кодом на Крохе и лист с выводом программы' },
  },
  {
    name: 'Короткие ссылки',
    slug: 'links',
    langs: ['Python'],
    repo: `${GH}/link-shortener`,
    what: 'Сокращает ссылки и считает переходы.',
    detail: 'Видно, сколько раз открыли ссылку, откуда пришли и с какого устройства. Превью в мессенджерах за людей не считаются. Запускается в Docker вместе с PostgreSQL и Redis.',
    stack: 'Python, FastAPI, PostgreSQL, Redis, Docker',
    colour: '#1f3fd1',
    shot: { src: '/shots/link-shortener.jpg', alt: 'Кобальтовый экран с только что сокращённой ссылкой' },
  },
  {
    name: 'Комната для группы',
    slug: 'chat',
    langs: ['TypeScript'],
    repo: `${GH}/study-chat`,
    what: 'Чат для группы. Регистрации нет, заходишь по ссылке.',
    detail: 'Если пропал интернет, сообщения ждут и уходят сами, без дублей. Переписка свёрстана как текст пьесы.',
    stack: 'Node.js, WebSocket, SQLite',
    colour: '#8c2346',
    shot: { src: '/shots/study-chat.jpg', alt: 'Переписка в виде пьесы с ремарками «Входит Даня» и «Даня печатает»' },
  },
  {
    name: 'Поиск пути',
    slug: 'pathfinding',
    langs: ['TypeScript'],
    repo: `${GH}/pathfinding-visualizer`,
    demo: 'https://ex3ittt.github.io/pathfinding-visualizer/',
    what: 'Показывает, как A*, Дейкстра и поиск в ширину ищут дорогу.',
    detail: 'Рисуешь стены и болота, двигаешь старт и финиш. Все алгоритмы можно сравнить на одной карте.',
    stack: 'TypeScript, Canvas',
    colour: '#b0247f',
    shot: { src: '/shots/pathfinding.jpg', alt: 'Лабиринт в стиле карты ориентирования с фиолетовым маршрутом' },
  },
  {
    name: 'Кто кому должен',
    slug: 'trip-split',
    langs: ['TypeScript'],
    repo: `${GH}/trip-split`,
    demo: 'https://ex3ittt.github.io/trip-split/',
    what: 'Делит траты в поездке и считает, кто кому сколько переводит.',
    detail: 'Переводов получается минимум. Поездку можно отправить друзьям одной ссылкой.',
    stack: 'React, TypeScript',
    colour: '#1b2a41',
    shot: { src: '/shots/trip-split.jpg', alt: 'Траты поездки и расчёт в виде кассового чека' },
  },
  {
    name: 'Лента',
    slug: 'typing',
    langs: ['TypeScript'],
    repo: `${GH}/typing-tape`,
    demo: 'https://ex3ittt.github.io/typing-tape/',
    what: 'Тренажёр слепой печати на русской раскладке.',
    detail: '16 уроков по рядам клавиатуры. После урока видно, на каких клавишах были ошибки.',
    stack: 'TypeScript, Vite',
    colour: '#ffd166',
    shot: { src: '/shots/typing-tape.jpg', alt: 'Лента с текстом и клавиатура с подсвеченными ошибками' },
  },
  {
    name: 'Тихий час',
    slug: 'quiet-hour',
    langs: ['JavaScript'],
    repo: `${GH}/quiet-hour`,
    what: 'Расширение для Chrome, которое на время работы закрывает отвлекающие сайты.',
    detail: 'Пишешь, чем займёшься, и ставишь таймер. Если зайти в ВК, там будет видно, сколько ещё осталось.',
    stack: 'JavaScript, Chrome Manifest V3',
    colour: '#e39a2d',
    shot: { src: '/shots/quiet-hour.jpg', alt: 'Страница «vk.com подождёт» с отсчётом до конца тихого часа' },
  },
  {
    name: 'deadlink',
    slug: 'deadlink',
    langs: ['Go'],
    repo: `${GH}/deadlink`,
    what: 'Ищет битые ссылки на сайте.',
    detail: 'Обходит все страницы и показывает, где что сломано. Можно запускать в CI.',
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
    slug: 'deadline-bot',
    langs: ['Python'],
    repo: `${GH}/deadline-bot`,
    what: 'Телеграм-бот, который напоминает о дедлайнах.',
    detail: 'Понимает обычный текст вроде «лаба до 25.10 18:00» или «курсач через 2 недели». Напоминает за 3 дня, за день и за 3 часа.',
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
