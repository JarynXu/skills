> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/safemoduleloading.russian.md`  
> Upstream Git blob: `da8dc75a703bdee968d05ebea15f32607ac115b4`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Избегайте загрузки модулей с использованием переменных

### Объяснение в один абзац

Избегайте вызова/импорта другого файла с путем, указанным в качестве параметра, из-за опасений, что он мог возникнуть из-за ввода пользователя. Это правило может быть расширено для доступа к файлам вообще (то есть `fs.readFile()`) или другим чувствительным ресурсам с динамическими переменными, происходящими из пользовательского ввода.

### Пример кода

```javascript
// insecure, as helperPath variable may have been modified by user input
const badWayToRequireUploadHelpers = require(helperPath);

// secure
const uploadHelpers = require('./helpers/upload');
```
