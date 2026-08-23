> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/safemoduleloading.basque.md`  
> Upstream Git blob: `98db3172a01a5491d87f6c199482696bc9fdd758`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Saihestu modulua kargatzea aldagai bat erabiliz

### Azalpena

Bidea erabiltzailea sartu ondoren sortua ote den kezka baduzu eta horregatik parametro gisa ezarri baduzu, saihestu bide hori erabiltzea beste fitxategi bat deitzeko / inportatzeko. Arau hori, oro har, edozein fitxategitara sartzeko erabil daiteke (hau da, `fs.readFile()`) edo erabiltzailea sartu ondoren sortutako aldagai dinamikoak dituen babestu beharreko beste baliabide batzuetara sartzeko. Eslint-plugin-security garbitzaileak (linterrak) eredu horiek atzeman eta nahikoa goiz ohartaraz dezake.

### Kode adibidea

```javascript
// ez segurua, helperPath aldagaia erabiltzaile sarrera batek aldatua izan ahal baita eta
const kargatzekoTresnaLagungarriakEskuratzekoModuOkerra = require(helperPath);

// segurua
const kargatzekoTresnaLagungarriak = require("./helpers/upload");
```
