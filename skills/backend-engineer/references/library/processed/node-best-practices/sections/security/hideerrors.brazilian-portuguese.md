> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/hideerrors.brazilian-portuguese.md`  
> Upstream Git blob: `560442af4e1c14d17bcd21a94a0d5ce25340b8b6`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Oculte detalhes de erros dos usuários

### Explicação em um Parágrafo

A exposição dos detalhes de erros da aplicação ao cliente em produção deve ser evitada devido ao risco de expor detalhes confidenciais do aplicativo, como caminhos de arquivo do servidor, módulos de terceiros em uso e outros fluxos de trabalho internos da aplicação que poderiam ser explorados por um invasor.
O Express vem com um manipulador de erros embutido, que cuida de quaisquer erros que possam ser encontrados na aplicação. Essa função de middleware padrão de tratamento de erros é adicionada no final do stack de funções do middleware.
Se você passar um erro para `next()` e você não o manipular em um manipulador de erro personalizado, ele será tratado pelo manipulador de erros Express; o erro será gravado no cliente com o rastreamento de stack. Esse comportamento será verdadeiro quando `NODE_ENV` for definido como `development`, no entanto, quando `NODE_ENV` for definido como `production`, o rastreio de pilha não será gravado, apenas o código de resposta HTTP.

### Exemplo de código: Manipulador de erros do express

``` javascript
// manipulador de erros em produção
// nenhum rastreamento de stack vazou para o usuário
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
```

### Recursos Adicionais

🔗 [Documentação de manipulação de erros do Express.js](https://expressjs.com/en/guide/error-handling.html)
