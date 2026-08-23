> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/projectstructre/wraputilities.russian.md`  
> Upstream Git blob: `3520ef383d3e768cae17b31636976c1aa84f5de8`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Оборачивайте общие утилиты в пакеты npm

<br/><br/>

### Объяснение в один абзац

Как только вы начнете расти и иметь разные компоненты на разных серверах, которые используют одинаковые утилиты, вы должны начать управлять зависимостями - как вы можете сохранить 1 копию своего кода утилиты и позволить нескольким потребительским компонентам использовать и развертывать ее? ну, есть инструмент для этого, он называется npm ... Начните с упаковки сторонних пакетов утилит с вашим собственным кодом, чтобы в будущем его можно было легко заменить, и опубликуйте свой собственный код как частный пакет npm. Теперь вся ваша кодовая база может импортировать этот код и использовать бесплатный инструмент управления зависимостями. Можно публиковать пакеты npm для личного использования, не публикуя их публично, используя [private modules](https://docs.npmjs.com/private-modules/intro), [private registry](https://npme.npmjs.com/docs/tutorials/npm-enterprise-with-nexus.html) или [local npm packages](https://medium.com/@arnaudrinquin/build-modular-application-with-npm-local-modules-dfc5ff047bcc)

<br/><br/>

### Совместное использование собственных общих утилит в средах и компонентах

![alt text](../../assets/images/Privatenpm.png "Structuring solution by components")
