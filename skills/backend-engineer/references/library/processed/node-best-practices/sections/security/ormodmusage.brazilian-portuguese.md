> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/ormodmusage.brazilian-portuguese.md`  
> Upstream Git blob: `e3234728473779a3c7377e34b9ef426d737f6ddd`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Impeça vulnerabilidades de query injection com bibliotecas ORM/ODM

### Explicação em um Parágrafo

Ao criar sua lógica de banco de dados, você deve estar atento a eventuais pontos de injeção que possam ser explorados por possíveis invasores.  Escrever consultas de banco de dados manualmente ou não, incluindo a validação de dados para solicitações do usuário, são os métodos mais fáceis para permitir essas vulnerabilidades. No entanto, é fácil evitar essa situação quando você usa pacotes adequados para validar entradas e manipular operações do banco de dados. Em muitos casos, seu sistema estará são e salvo usando uma biblioteca de validação como
[joi](https://github.com/hapijs/joi) ou [yup](https://github.com/jquense/yup) e uma biblioteca ORM/ODM da lista abaixo. Isso deve garantir o uso de consultas parametrizadas e vinculações de dados para garantir que os dados validados sejam adequadamente ignorados e manipulados sem abrir vetores de ataque indesejados. Muitas dessas bibliotecas facilitarão sua vida como desenvolvedor, ativando muitos recursos úteis, como não ter que escrever consultas complexas manualmente, fornecendo tipos para sistemas de tipos baseados em idioma ou convertendo tipos de dados em formatos desejados. Para concluir, __sempre__ valide todos os dados que você irá armazenar e use bibliotecas de mapeamento de dados adequadas para lidar com o trabalho perigoso para você.

### Bibliotecas

- [TypeORM](https://github.com/typeorm/typeorm)
- [sequelize](https://github.com/sequelize/sequelize)
- [mongoose](https://github.com/Automattic/mongoose)
- [Knex](https://github.com/tgriesser/knex)
- [Objection.js](https://github.com/Vincit/objection.js)
- [waterline](https://github.com/balderdashy/waterline)

### Exemplo - Injeção de consulta NoSQL

```javascript
// Uma consulta de
db.balances.find( { active: true, $where: function() { return obj.credits - obj.debits < userInput; } } );

// Onde userInput igual a
"(function(){var date = new Date(); do{curDate = new Date();}while(curDate-date<10000); return Math.max();})()"

// irá desencadear uma negação de serviço

// Outra entrada do usuário pode injetar outra lógica, resultando no banco de dados expondo dados sensíveis
```

### Exemplo - Injeção SQL

```sql
SELECT username, firstname, lastname FROM users WHERE id = 'user input';

SELECT username, firstname, lastname FROM users WHERE id = 'evil'input';
```

### Recursos adicionais

🔗 [OWASP Injeção SQL](https://www.owasp.org/index.php/SQL_Injection)

🔗 [OWASP Folha de Dicas de Prevenção de Injeção SQL](https://github.com/OWASP/CheatSheetSeries)

🔗 [Teste para Injeções NoSQL](https://www.owasp.org/index.php/Testing_for_NoSQL_injection)

### O que outros Blogueiros dizem

Riscos de injeção NoSQL da [OWASP wiki](https://www.owasp.org/index.php/Testing_for_NoSQL_injection)

> Ataques de injeção NoSQL podem ser executados em áreas diferentes do que uma injeção SQL tradicional em uma aplicação. Onde a injeção SQL seria executada no mecanismo do banco de dados, as variantes do NoSQL podem ser executadas na camada da aplicação ou na camada do banco de dados, dependendo da API NoSQL usada e do modelo de dados. Normalmente, os ataques de injeção NoSQL executarão onde a sequência de ataque é analisada, avaliada ou concatenada em uma chamada de API NoSQL.
