> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/codestylepractices/eslint_prettier.russian.md`  
> Upstream Git blob: `bd5e282be47fa54bdd1b102c9e5a9027b2027d21`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Использование ESLint и Prettier


### Сравнение ESLint и Prettier

Если вы отформатируете код ниже с помощью ESLint, он просто выдаст вам предупреждение, что он слишком широкий (зависит от настроек `max-len`). Prettier же автоматически отформатирует его для вас.

```javascript
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne(), noWayYouGottaBeKiddingMe());
```

```javascript
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne(),
  noWayYouGottaBeKiddingMe()
);
```

Source: [https://github.com/prettier/prettier-eslint/issues/101](https://github.com/prettier/prettier-eslint/issues/101)

### Интеграция ESLint и Prettier

ESLint и Prettier перекрываются в функции форматирования кода, но могут быть легко объединены с помощью других пакетов, таких как [prettier-eslint](https://github.com/prettier/prettier-eslint), [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier), и [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier). Для получения дополнительной информации об их различиях вы можете просмотреть ссылку [здесь](https://stackoverflow.com/questions/44690308/whats-the-difference-between-prettier-eslint-eslint-plugin-prettier-and-eslint).
