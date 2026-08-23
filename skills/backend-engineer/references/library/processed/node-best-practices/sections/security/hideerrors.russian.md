> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/hideerrors.russian.md`  
> Upstream Git blob: `755b460c6c765b45c519e73c610489e3a6f327f9`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Скрывайте детали ошибок от клиентов

### Объяснение в один абзац

Следует избегать предоставления подробных сведений об ошибках в сообщениях клиенту в производственном процессе, поскольку существует риск раскрытия таких важных сведений приложения, как пути к файлам сервера, используемые сторонние модули и другие внутренние рабочие процессы приложения, которые могут быть использованы злоумышленником.
Express поставляется со встроенным обработчиком ошибок, который заботится о любых ошибках, которые могут возникнуть в приложении. Эта промежуточная функция обработки ошибок по умолчанию добавляется в конец стека функций промежуточного программного обеспечения.
Если вы передаете ошибку в `next()` и не обрабатываете ее в пользовательском обработчике ошибок, она будет обработана встроенным обработчиком ошибок Express; ошибка будет записана клиенту с трассировкой стека. Это поведение будет истинным, если для `NODE_ENV` установлено значение `development`, однако, если для `NODE_ENV` установлено значение `production`, трассировка стека не записывается, только код ответа HTTP.

### Пример кода: экспресс-обработчик ошибок

```javascript
// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
```

### Дополнительные ресурсы

🔗 [Express.js error handling documentation](https://expressjs.com/en/guide/error-handling.html)
