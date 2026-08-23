> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/codestylepractices/eslint_prettier.md`  
> Upstream Git blob: `8d52a1dbd90f0b76eaf586f3203d006abc0bd79c`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Using ESLint and Prettier


### Comparing ESLint and Prettier

If you format this code using ESLint, it will just give you a warning that it's too wide (depends on your `max-len` setting). Prettier will automatically format it for you.

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

### Integrating ESLint and Prettier

ESLint and Prettier overlap in the code formatting feature but can be easily combined by using other packages like [prettier-eslint](https://github.com/prettier/prettier-eslint), [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier), and [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier). For more information about their differences, you can view the link [here](https://stackoverflow.com/questions/44690308/whats-the-difference-between-prettier-eslint-eslint-plugin-prettier-and-eslint).
