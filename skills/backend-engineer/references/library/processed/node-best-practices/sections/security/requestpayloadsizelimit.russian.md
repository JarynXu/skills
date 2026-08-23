> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/requestpayloadsizelimit.russian.md`  
> Upstream Git blob: `48e58060fe3935957aa235be6e20a090e46656d1`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Ограничивайте размер полезной нагрузки с помощью обратного прокси или промежуточного ПО

### Объяснение в один абзац

Разбор тел запросов, например JSON-кодированных полезных нагрузок, является операцией с высокой производительностью, особенно с большими запросами.
При обработке входящих запросов в вашем веб-приложении вы должны ограничить размер их соответствующих полезных нагрузок. Поступающие запросы с неограниченными размерами тела/полезной нагрузки могут привести к плохой работе приложения или к его сбоям из-за сбоя в отказе в обслуживании или других нежелательных побочных эффектов.
Многие популярные middleware-решения для синтаксического анализа тел запросов, такие как уже включенный пакет body-parser для express, предоставляют опции для ограничения размеров полезных нагрузок запросов, облегчая разработчикам реализацию этой функциональности. Вы также можете интегрировать ограничение размера тела запроса в программное обеспечение обратного прокси-сервера/веб-сервера, если оно поддерживается. Ниже приведены примеры ограничения размеров запросов с использованием `express` и/или` nginx`.


### Пример кода для `express`

```javascript
const express = require('express');

const app = express();

app.use(express.json({ limit: '300kb' })); // body-parser defaults to a body size limit of 100kb

// Request with json body
app.post('/json', (req, res) => {

    // Check if request payload content-type matches json, because body-parser does not check for content types
    if (!req.is('json')) {
        return res.sendStatus(415); // -> Unsupported media type if request doesn't have JSON body
    }

    res.send('Hooray, it worked!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
```

🔗 [**Express docs for express.json()**](http://expressjs.com/en/4x/api.html#express.json)

### Пример конфигурации для `nginx`

```nginx
http {
    ...
    # Limit the body size for ALL incoming requests to 1 MB
    client_max_body_size 1m;
}

server {
    ...
    # Limit the body size for incoming requests to this specific server block to 1 MB
    client_max_body_size 1m;
}

location /upload {
    ...
    # Limit the body size for incoming requests to this route to 1 MB
    client_max_body_size 1m;
}
```

🔗 [**Nginx docs for client_max_body_size**](http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size)
