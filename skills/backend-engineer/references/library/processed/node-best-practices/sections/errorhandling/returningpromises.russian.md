> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/errorhandling/returningpromises.russian.md`  
> Upstream Git blob: `01df841067ff4e8f77233a9756ecf7575e3c41ef`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Возвращение промисов

<br/>

### Короткое объяснение

У v8 есть особая способность, называемая "бесплатные асинхронные стектрейсы", которая позволяет стектрейсам не
обрываться на самом позднем `await`. Но, из-за нетривиальных нюансов реализации, она не сработает если возвращаемое
значение функции (синхронной или асинхронной) является промис. По этому, для того чтобы избежать дыр в стектрейсах
после отказа (rejection) возвращаемого промиса, следует всегда явно разрешать (resolve) промисы при помощи `await`
перед тем как возвращать их из функций

<br/>

### Анти-паттерн №1: return `promise`

<details><summary>Javascript</summary>
<p>

```javascript
async function throwAsync(msg) {
  await null // нужно выполнить await для того что бы функция была по-настоящему асинхронной (см. заметку №2)
  throw Error(msg)
}

async function returnWithoutAwait () {
  return throwAsync('missing returnWithoutAwait in the stacktrace')
}

// 👎 returnWithoutAwait будет отсутствовать в стектрейсе
returnWithoutAwait().catch(console.log)
```

выведет в лог

```
Error: missing returnWithoutAwait in the stacktrace
    at throwAsync ([...])
```

</p>
</details>

### Как правильно: return await `promise`

<details><summary>Javascript</summary>
<p>

```javascript
async function throwAsync(msg) {
  await null // нужно выполнить await для того что бы функция была по-настоящему асинхронной (см. заметку №2)
  throw Error(msg)
}

async function returnWithAwait() {
  return await throwAsync('with all frames present')
}

// 👍 returnWithAwait будет присутствовать в стектрейсе
returnWithAwait().catch(console.log)
```

выведет в лог

```
Error: with all frames present
    at throwAsync ([...])
    at async returnWithAwait ([...])
```

</p>
</details>

<br/>

### Анти-паттерн №2: синхронная функция возвращающая промис

<details><summary>Javascript</summary>
<p>

```javascript
async function throwAsync () {
  await null // нужно выполнить await для того что бы функция была по-настоящему асинхронной (см. заметку №2)
  throw Error('missing syncFn in the stacktrace')
}

function syncFn () {
  return throwAsync()
}

async function asyncFn () {
  return await syncFn()
}

// 👎 syncFn будет отсутствовать в стектрейсе так как она синхронная и возвращает промис
asyncFn().catch(console.log)
```

would log

```
Error: missing syncFn in the stacktrace
    at throwAsync ([...])
    at async asyncFn ([...])
```

</p>
</details>

### Как правильо: объявить функцию возвращающую промис как асинхронную

<details><summary>Javascript</summary>
<p>

```javascript
async function throwAsync () {
  await null // нужно выполнить await для того что бы функция была по-настоящему асинхронной (см. заметку №2)
  throw Error('with all frames present')
}

async function changedFromSyncToAsyncFn () {
  return await throwAsync()
}

async function asyncFn () {
  return await changedFromSyncToAsyncFn()
}

// 👍 теперь changedFromSyncToAsyncFn будет присутствовать в стектрейсе
asyncFn().catch(console.log)
```

would log

```
Error: with all frames present
    at throwAsync ([...])
    at changedFromSyncToAsyncFn ([...])
    at async asyncFn ([...])
```

</p>
</details>

<br/>

### Анти-паттерн №3: прямая передача асинхронного коллбэка в месте где ожидается синхронный коллбек

<details><summary>Javascript</summary>
<p>

```javascript
async function getUser (id) {
  await null
  if (!id) throw Error('stacktrace is missing the place where getUser has been called')
  return {id}
}

const userIds = [1, 2, 0, 3]

// 👎 хотя в стектрейсе будет присутствовать функция getUser, в нем не будет места где она была вызвана
Promise.all(userIds.map(getUser)).catch(console.log)
```

выведет в лог

```
Error: stacktrace is missing the place where getUser has been called
    at getUser ([...])
    at async Promise.all (index 2)
```

*Между прочим*: может показаться что  `Promise.all (index 2)` может помоч понять где `getUser` была вызвана, но из-за
[совершенно другого бага в v8](https://bugs.chromium.org/p/v8/issues/detail?id=9023), `(index 2)` является строкой из
внутреннего кода v8

</p>
</details>

### Как правильно: обернуть асинхронный коллбэк в асинхронную функция перед тем как передать его как синхронный коллбэк

<details><summary>Javascript</summary>
<p>

*Заметка 1*: в случае если вы отвечаете за код функции которая в итоге вызовет коллбэк - просто сделаете ее асинхронной и
добавьте `await` перед вызовом коллбэка. Далее я предполагаю что вы не имеете контроля над кодом функции которая
вызывает коллбэк (или ее изменение таким образом недопустимо, например, из соображений обратной совместимости)

*Заметка 2*: Имейте ввиду, часто передача асинхронного коллбэка в место где ожидается синхронный коллбэк вообще не будет работать.
Тут описывается не как починить такой код а лишь как починить стектрейсы если код уже работает как ожидается

```javascript
async function getUser (id) {
  await null
  if (!id) throw Error('with all frames present')
  return {id}
}

const userIds = [1, 2, 0, 3]

// 👍 теперь строка вызова getUser присутствует в стектрейсе
Promise.all(userIds.map(async id => await getUser(id))).catch(console.log)
```

выведет в лог

```
Error: with all frames present
    at getUser ([...])
    at async ([...])
    at async Promise.all (index 2)
```

где, благодаря явному `await` в `map`, конец строки `at async ([...])` указывает на место где `getUser` была вызвана

*Между прочим*: если оберточная асинхронная функция для `getUser` не сделает явный `await` перед возвратом (то есть
комбинация анти-паттерн 1 + анти-паттерн 3), то стектрейс останется вообще всегда с одним кадром:

```javascript
[...]

// 👎 анти-паттерн 1 + анти-паттерн 3 - в стектрейсе осталась только getUser
Promise.all(userIds.map(async id => getUser(id))).catch(console.log)
```

выведет в лог

```
Error: [...]
    at getUser ([...])
```

</p>
</details>

<br/>

### Углубленное объяснение

Механизмы стоящие за построением синхронных и асинхронных стектрейсов в v8 довольно сильно отличаются: синхронные
стектрейсы основаны на **стеке** операционной системы на которой запущен Node.js (как и для многих других языков
программирования). Во время выполнения асинхронной функции, **стек** операционной системы выталкивает функцию как
только та доходит до первого-же `await`. По этому асинхронные стектрейсы представляют собой смесь **стека**
операционной системы и **цепочки разрешения отказанного (rejected) промиса**. "Бесплатные асинхронные стектрейсы"
реализованны таким образом что **цепочка разрешения промиса** расширяется только когда на промисе исполняется `await`
<span>[¹](#1)</span>. По сколько только асинхронные функции могут использовать `await`, синхронные функции
всегда будут упущены из асинхронного стектрейса если любая асинхронная операция была исполнена после момента вызова
этой синхронной функции <span>[²](#2)</span>

### Компромисc

Каждый `await` создает дополнительную микрозадачу (microtask) в цикле событий (event loop), по
этому дополнительные `await`-ы в коде создадут определенную дополнительную нагрузку. Тем ни менее,
задержки создаваемые сетью и базой данных [несоизмеримо выше](https://colin-scott.github.io/personal_website/research/interactive_latency.html)
по этому нагрузка создаваемая дополнительными `await`-ами не является чем-то что стоит принимать во
внимание при разработке веб-серверов или интерфейсов командной строки (CLI), разве что для очень
горячих участков кода на запрос или команду. По этому убирание `await`-ов из `return await` должно
быть одним из последних мест для поиска значимых улучшений производительности приложения и точно не
должно выполняться наперед

### Почему return await раньше считалось анти-паттерном

Существует ряд [отличных статей](https://jakearchibald.com/2017/await-vs-return-vs-return-await/) объясняющих почему
`return await` никогда не должен быть использован за пределами `try` блока и даже
[правело ESLint](https://eslint.org/docs/rules/no-return-await) которое такое использование запрещает. Причина
заключается в том что с момента когда async/await стали доступны с помощью транспайлеров в Node.js 0.10 (и получил
встроенную поддержку с Node.js 7.6) и до момента пока не появились "бесплатные асинхронные стектрейсы", `return await`
было абсолютно эквивалентно `await` для любого кода за пределами `try` блока. Для каких-то ES движков это все так-же
может оставаться правдой. По этой причине разрешение (resolve) промисов перед возвращением является лучшей практикой
для Node.js, а не для EcmaScript в целом

### Заметки:
1. Одной из причин почему асинхронные сетктрейсы имеют столь нетривиальную реализация является требование к
стектрейсу быть созданными синхронно, в пределах одного цикла петли событий (event loop) <span id="a1">[¹](#1)</span>
2. без `await` в `throwAsync` весь код выполнится в одной фазе петли событий (event loop). Это вырожденный случай
когда **стек** операционной системы не успеет опустошиться и стектрейс будет полным даже без явного `await` результата
вызова функции. Обычно использование промисов подразумевает исполнение асинхронных операций, а значит части стектрейса
все-же будут утрачены
3. "Бесплатные асинхронные стектрейсы" не работают для особо сложных потоков промисов, например когда `await`
выполняется для одного и того-же промиса в разных местах

### References:
  <span id="1">1. </span>[Блогпост о бесплатных асинхронных стектрейсах в v8](https://v8.dev/blog/fast-async)
  <br/>

  <span id="2">2. </span>[Документ о бесплатных асинхронных стектрейсах в v8 с упомянутыми тут деталями реализации](
    https://docs.google.com/document/d/13Sy_kBIJGP0XT34V1CV3nkWya4TwYx9L3Yv45LdGB6Q/edit
  )
  <br/>
