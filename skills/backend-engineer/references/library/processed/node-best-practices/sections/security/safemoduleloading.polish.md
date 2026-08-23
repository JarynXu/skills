> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/safemoduleloading.polish.md`  
> Upstream Git blob: `72f62acabcaf5a5f4f7599b6706d6b0a3f7deca2`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Unikaj ładowania modułu za pomocą zmiennej

### Wyjaśnienie jednym akapitem

Unikaj wymagania / importowania innego pliku ze ścieżką podaną jako parametr ze względu na obawy, że mógł on pochodzić z danych wejściowych użytkownika. Regułę tę można rozszerzyć w celu uzyskania ogólnego dostępu do plików (tj. `Fs.readFile()`) lub innych wrażliwych zasobów ze zmiennymi dynamicznymi pochodzącymi z danych wprowadzanych przez użytkownika.

### Przykład kodu

```javascript
// insecure, as helperPath variable may have been modified by user input
const badWayToRequireUploadHelpers = require(helperPath);

// secure
const uploadHelpers = require('./helpers/upload');
```
