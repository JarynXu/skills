> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/secureserver.russian.md`  
> Upstream Git blob: `dfe4f0ae5dc0ce4f2ff23efc470f578c42469772`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Используйте HTTPS для шифрования соединения клиент-сервер

<br/><br/>


### Объяснение в один абзац

Использование таких служб, как [Let'sEncrypt](https://letsencrypt.org/), центр сертификации, который предоставляет __free__ сертификаты SSL/TLS, может помочь зашифровать связь ваших приложений. Среды Node.js, такие как [Express](http://expressjs.com/) (основанные на модуле `https`), поддерживают SSL/TLS, который может быть реализован в несколько строк кода.

Вы также можете настроить SSL/TLS на обратном прокси, например [NGINX] (http://nginx.org/en/docs/http/configuring_https_servers.html) или HAProxy.

<br/><br/>

### Пример кода - Включение SSL/TLS с использованием платформы Express

```javascript
const express = require('express');
const https = require('https');
const app = express();
const options = {
    // The path should be changed accordingly to your setup
    cert: fs.readFileSync('./sslcert/fullchain.pem'),
    key: fs.readFileSync('./sslcert/privkey.pem')
};
https.createServer(options, app).listen(443);
```

<br/><br/>
