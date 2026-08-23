> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/LTSrelease.russian.md`  
> Upstream Git blob: `2851563cc52bfada4f0972f22ce17aeaed3da658`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Используйте LTS-релиз Node.js в производстве

### Объяснение в один абзац

Убедитесь, что вы используете LTS (Long Term Support) версию Node.js в работе, чтобы получать критические исправления ошибок, обновления безопасности и улучшения производительности.

LTS-версии Node.js поддерживаются в течение не менее 18 месяцев и обозначаются четными номерами версий (например, 4, 6, 8). Они лучше всего подходят для производства, поскольку линия выпуска LTS ориентирована на стабильность и безопасность, тогда как линия выпуска "текущий" имеет более короткий срок службы и более частые обновления кода. Изменения в версиях LTS ограничены исправлениями ошибок для стабильности, обновлениями безопасности, возможными обновлениями npm, обновлениями документации и некоторыми улучшениями производительности, которые можно продемонстрировать, чтобы не сломать существующие приложения.

<br/><br/>

### Читать еще

🔗 [Node.js release definitions](https://nodejs.org/en/about/releases/)

🔗 [Node.js release schedule](https://github.com/nodejs/Release)

🔗 [Essential Steps: Long Term Support for Node.js by Rod Vagg](https://medium.com/@nodesource/essential-steps-long-term-support-for-node-js-8ecf7514dbd)
> ... график дополнительных выпусков в каждом из них будет зависеть от наличия исправлений ошибок, исправлений безопасности и других небольших, но важных изменений. Основное внимание будет уделяться стабильности, но стабильность также включает в себя минимизацию количества известных ошибок и устранение проблем безопасности по мере их возникновения.

<br/><br/>
