> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/ormodmusage.russian.md`  
> Upstream Git blob: `1536e1dea7ff1ea1910f04a9f794d801d18059e0`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Предотвращайте уязвимости при внедрении базы данных с помощью библиотек ORM/ODM или других пакетов DAL

### Объяснение в один абзац

При создании логики базы данных вы должны следить за возможными векторами внедрения, которые могут быть использованы потенциальными злоумышленниками. Написание запросов к базе данных вручную или без проверки данных для пользовательских запросов - это самый простой способ устранения этих уязвимостей. Эту ситуацию, однако, легко избежать, когда вы используете подходящие пакеты для проверки ввода и обработки операций с базой данных. Во многих случаях ваша система будет в целости и сохранности благодаря использованию библиотеки валидации, например [joi](https://github.com/hapijs/joi) или [yup](https://github.com/jquense/yup) и ORM/ODM из списка ниже. Это должно гарантировать использование параметризованных запросов и привязок данных, чтобы гарантировать, что проверенные данные должным образом экранируются и обрабатываются без открытия нежелательных векторов атаки. Многие из этих библиотек облегчат вашу жизнь разработчика, предоставив множество полезных функций, таких как отсутствие необходимости писать сложные запросы вручную, предоставление типов для языковых систем типов или преобразование типов данных в требуемые форматы. В заключение, __always__ проверяйте любые данные, которые вы собираетесь хранить, и используйте соответствующие библиотеки отображения данных, чтобы справиться с опасной для вас работой.


### Библиотеки

- [TypeORM](https://github.com/typeorm/typeorm)
- [sequelize](https://github.com/sequelize/sequelize)
- [mongoose](https://github.com/Automattic/mongoose)
- [Knex](https://github.com/tgriesser/knex)
- [Objection.js](https://github.com/Vincit/objection.js)
- [waterline](https://github.com/balderdashy/waterline)

### Пример - внедрение запроса в NoSQL

```javascript
// A query of
db.balances.find({
  active: true,
  $where: (obj) => obj.credits - obj.debits < userInput
});;

// Where userInput equals
"(function(){var date = new Date(); do{curDate = new Date();}while(curDate-date<10000); return Math.max();})()"

// will trigger a denial of service

// Another user input might inject other logic resulting in the database exposing sensitive data
```

### Пример - SQL-инъекция

```sql
SELECT username, firstname, lastname FROM users WHERE id = 'user input';

SELECT username, firstname, lastname FROM users WHERE id = 'evil'input';
```

### Дополнительные ресурсы

🔗 [OWASP SQL Injection](https://www.owasp.org/index.php/SQL_Injection)

🔗 [OWASP SQL Injection Prevention Cheat Sheet](https://github.com/OWASP/CheatSheetSeries)

🔗 [Testing for NoSQL Injection](https://www.owasp.org/index.php/Testing_for_NoSQL_injection)

### Что говорят другие блогеры

Риски внедрения NoSQL из [OWASP wiki](https://www.owasp.org/index.php/Testing_for_NoSQL_injection)

> Атаки NoSQL-инъекцией могут выполняться в других областях приложения, чем традиционные SQL-инъекции. Там, где SQL-инъекция будет выполняться в ядре базы данных, варианты NoSQL могут выполняться во время на уровне приложения или на уровне базы данных, в зависимости от используемого API-интерфейса NoSQL и модели данных. Обычно атаки с внедрением NoSQL выполняются там, где строка атаки анализируется, оценивается или объединяется в вызов API NoSQL.
