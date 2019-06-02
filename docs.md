Стек проекта:
  1. sass
  2. pixi.js
  3. webpack
  4. babel
  5. postcss
  6. pubsub.js

Webpack entrypoint: assets.js
Главный скриптовый файл: main.js

main.js:
  Импорт остальных библиотек
    - Animator.js
    - Pixer.js
    - Paginator.js

Animator.js
  1. Определяет цвет и значение mix-blend-mode спец. масок.
     Маска это левый слой с описанием страницы.
  2. Реализует логику перехода слайдов
  3. Устанавливает подписки и callback-функции, срабатываемые
     при публикации.
     Подписки:
      - begin
      - gotoSlide
