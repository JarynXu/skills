> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/secureheaders.russian.md`  
> Upstream Git blob: `34ea4fc1b61e5d9e7080a4e553991c9f5c06e934`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Используйте связанные с безопасностью заголовки для защиты вашего приложения от распространенных атак

<br/><br/>


### Объяснение в один абзац

Существуют связанные с безопасностью заголовки, используемые для дальнейшей защиты вашего приложения. Самые важные заголовки перечислены ниже. Вы также можете посетить сайты, ссылки на которые есть в нижней части этой страницы, чтобы получить больше информации по этой теме. Вы можете легко установить эти заголовки, используя модуль [Helmet](https://www.npmjs.com/package/helmet) для экспресс-доставки ([Helmet for koa](https://www.npmjs.com/package/koa-helmet)).

<br/><br/>

### Оглавление
- [HTTP Strict Transport Security (HSTS)](#http-strict-transport-security-hsts)
- [Public Key Pinning for HTTP (HPKP)](#public-key-pinning-for-http-hpkp)
- [X-Frame-Options](#x-frame-options)
- [X-XSS-Protection](#x-xss-protection)
- [X-Content-Type-Options](#x-content-type-options)
- [Referrer-Policy](#referrer-policy)
- [Expect-CT](#expect-ct)
- [Content-Security-Policy](#content-security-policy)
- [Дополнительные ресурсы](#дополнительные-ресурсы)

<br/><br/>

### HTTP Strict Transport Security (HSTS)

HTTP Strict Transport Security (HSTS) - это механизм политики веб-безопасности для защиты веб-сайтов от [атак с использованием понижения степени защиты](https://en.wikipedia.org/wiki/Downgrade_attack) и [перехвата файлов cookie](https://www.owasp.org/index.php/Session_hijacking_attack). Он позволяет веб-серверам объявлять, что веб-браузеры (или другие соответствующие пользовательские агенты) должны взаимодействовать с ним только с использованием __secure HTTPS-соединений__ и __never__ через небезопасный протокол HTTP. Политика HSTS реализуется с помощью заголовка `Strict-Transport-Security` поверх существующего HTTPS-соединения.

Заголовок Strict-Transport-Security принимает значение `max-age` в секундах, чтобы уведомить браузер, как долго он должен обращаться к сайту, используя только HTTPS, и значение `includeSubDomains`, чтобы применить правило Strict Transport Security ко всем субдомены сайта.

Пример заголовка - политика HSTS включена в течение одной недели, включая субдомены
```
Strict-Transport-Security: max-age=2592000; includeSubDomains
```

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#hsts)

🔗 [Читать MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

<br/><br/>

### Public Key Pinning for HTTP (HPKP)

Public Key Pinning for HTTP (HPKP) - это механизм безопасности, позволяющий веб-сайтам HTTPS противостоять подлогам злоумышленников, использующими неправильно выданные или иным образом мошеннические сертификаты SSL/TLS.

Веб-сервер HTTPS обслуживает список хэшей открытых ключей, и при последующих подключениях клиенты ожидают, что этот сервер будет использовать один или несколько из этих открытых ключей в своей цепочке сертификатов. Тщательно используя эту функцию, вы можете значительно снизить риск атак типа "человек посередине (атака посредника)" (MITM) и других проблем с ложной аутентификацией для пользователей вашего приложения, не подвергаясь чрезмерному риску.

Перед внедрением вы должны сначала взглянуть на заголовок `Expect-CT` из-за его повышенной гибкости для восстановления после неправильной настройки и других [возможностей](https://groups.google.com/a/chromium.org/forum/m/#!msg/blink-dev/he9tr7p3rZ8/eNMwKPmUBAAJ).

Заголовок Public-Key-Pins принимает 4 значения, значение `pin-sha256` для добавления открытого ключа сертификата, хэшированное с использованием алгоритма SHA256, который можно добавлять несколько раз для разных открытых ключей, значение `max-age` для сообщения браузеру, как долго ему следует применять правило, значение `includeSubDomains`, чтобы применить это правило ко всем поддоменам, и значение `report-uri`, чтобы сообщать о сбоях проверки пина по указанному URL.

Пример заголовка - политика HPKP включена на одну неделю, включает субдомены, сообщает об ошибках на примерный URL и разрешает два открытых ключа
```
Public-Key-Pins: pin-sha256="d6qzRu9zOECb90Uez27xWltNsj0e1Md7GkYYkVoZWmM="; pin-sha256="E9CZ9INDbd+2eRQozYqqbQ2yXLVKB9+xcprMF+44U1g="; report-uri="http://example.com/pkp-report"; max-age=2592000; includeSubDomains
```

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#hpkp)

🔗 [Читать MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning)

<br/><br/>

### X-Frame-Options

Заголовок X-Frame-Options защищает приложение от атак [Clickjacking](https://www.owasp.org/index.php/Clickjacking), объявляя политику того, как ваше приложение может быть встроено в другие (внешние) страницы с использованием фреймов. ,

X-Frame-Options позволяет 3 параметра: параметр `deny`, запрещающий встраивание ресурса в целом, параметр `sameorigin`, позволяющий встраивать ресурс на том же хосте/источнике, и параметр `allow-from` для указания хоста, где вложение ресурса разрешено.

Пример заголовка - Запретить встраивание вашего приложения
```
X-Frame-Options: deny
```

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xfo)

🔗 [Читать MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

<br/><br/>

### X-XSS-Protection

Этот заголовок включает фильтр [Межсайтовый скриптинг](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)) в вашем браузере.

Он принимает 4 параметра: `0` для отключения фильтра, `1` для включения фильтра и включения автоматической очистки страницы, `mode=block` для включения фильтра и предотвращения рендеринга страницы при обнаружении атаки XSS (этот параметр необходимо добавить к `1`, используя точку с запятой, и `report=<domainToReport>`, чтобы сообщить о нарушении (этот параметр должен быть добавлен к `1`).

Пример заголовка - включите защиту XSS и сообщите о нарушениях к примеру URL
```
X-XSS-Protection: 1; report=http://example.com/xss-report
```

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xxxsp)

🔗 [Читать OWASP Secure Headers Project](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)

<br/><br/>

### X-Content-Type-Options

Установка этого заголовка не позволит браузеру [интерпретировать файлы как что-то еще](https://en.wikipedia.org/wiki/Content_sniffing), нежели объявленным типом содержимого в заголовках HTTP.

Пример заголовка - Запретить перехват содержимого
```
X-Content-Type-Options: nosniff
```

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xcto)

🔗 [Читать MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)


<br/><br/>

### Referrer-Policy

HTTP-заголовок Referrer-Policy определяет, какая информация о реферере, отправленная в заголовке `Referer`, должна быть включена в сделанные запросы.

Он разрешает 8 параметров, параметр `no-referrer` для полного удаления заголовка `Referer`, `no-referrer-when-downgrade` для удаления заголовка `Referer` при понижении, например HTTPS -> HTTP, `origin` параметр для отправки источника хоста (корня хоста) в качестве реферера __only__, параметр `origin-when-cross-origin` для отправки URL-адреса полного источника, когда он остается на том же источнике, и отправки источника хоста __only__, если в противном случае, параметр `same-origin` для отправки информации о реферере только для источников с одним и тем же сайтом и пропуск в запросах между источниками, параметр `strict-origin` для сохранения заголовка `Referer` только на одном уровне безопасности (HTTPS -> HTTPS) и пропуска его в менее безопасном месте назначения, параметре `strict-origin-when-cross-origin` для отправки полного URL-адреса реферера в место назначения того же источника, источник __only__ в место назначения перекрестного источника на уровне безопасности __same__ и нет реферера в менее безопасном перекрестном источнике и параметр `unsafe-url` для отправки полного реферера места назначения того же или перекрестного происхождения.

Пример заголовка - полностью удалите заголовок `Referer`
```
Referrer-Policy: no-referrer
```

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#rp)

🔗 [Читать MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)


<br/><br/>

### Expect-CT

Заголовок Expect-CT используется сервером для указания того, что браузеры должны оценивать соединения с хостом, испускающим заголовок для соответствия [прозрачности сертификата](https://www.certificate-transparency.org/).

Этот заголовок принимает 3 параметра: параметр `report-uri` для предоставления URL-адреса, по которому следует сообщать о сбоях Expect-CT, параметр `forcece`, указывающий браузеру, что прозрачность сертификата должна применяться (а не только сообщаться), и отказываться от будущих подключений, нарушающих прозрачность сертификата и параметра `max-age` для указания количества секунд, в течение которых браузер рассматривает хост как известный хост Expect-CT.

Пример заголовка - Обеспечить прозрачность сертификата в течение недели и сообщить пример URL
```
Expect-CT: max-age=2592000, enforce, report-uri="https://example.com/report-cert-transparency"
```

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#ect)


<br/><br/>

### Content-Security-Policy

Заголовок ответа HTTP Content-Security-Policy позволяет контролировать ресурсы, которые пользовательский агент может загружать для данной страницы. За некоторыми исключениями, политики в основном включают указание происхождения сервера и конечных точек сценария. Это помогает защититься от [межсайтовых скриптовых атак (XSS)](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)).

Пример заголовка - включите CSP и выполняйте сценарии только из одного источника
```
Content-Security-Policy: script-src 'self'
```

Существует много политик, включенных с помощью Content-Security-Policy, которые можно найти на сайтах, ссылки на которые приведены ниже.

🔗 [Читать OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#csp)

🔗 [Читать MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)


<br/><br/>

### Дополнительные ресурсы

🔗 [OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#tab=Headers)

🔗 [Node.js Security Checklist (RisingStack)](https://blog.risingstack.com/node-js-security-checklist/)


<br/><br/>
