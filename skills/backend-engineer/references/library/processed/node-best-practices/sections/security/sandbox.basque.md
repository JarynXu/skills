> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/sandbox.basque.md`  
> Upstream Git blob: `100fbd9edfe22c21f4c013167fb00e99232747ef`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Exekutatu kode ez segurua sandbox batean

### Azalpena

Arau orokor gisa, zure JavaScript fitxategiak bakarrik egikaritu beharko zenituzke. Teoriak alde batera utzita, mundu errealeko eszenatokiek egikaritzen dituzten JavaScript fitxategietako asko esleitutako egikaritze denbora dinamikoki gainditua duten fitxategiak dira. Adibidez, pentsatu esparru dinamikoak web paketeak direla, plataforma pertsonalizatuak onartzen dituztenak eta plataforma horiek dinamikoki egikaritzen dituztenak konpilazio aldian. Plugin maltzurren bat dagoenean kalteak minimizatu nahi ditugu eta, agian, fluxua arrakastaz amaitzen utzi ere bai. Horrek eskatzen du guztiz isolatuta dagoen sandbox ingurune batean egikaritzea pluginak, hau da, baliabide, hutsegite eta pluginekin partekatzen dugun informazioarekiko isolatuta egon behar du ingurune horrek. Hiru dira isolamendua lortzen lagunduko diguten bideak:

- bigarren mailako prozesu dedikatua. Horrek informazioa bizkor isolatzeko aukera eskaintzen du, baina eskatzen du prozesua ondo ezagutu eta menperatzea, exekuzio denbora mugatzea eta akatsetatik berreskuratzea
- hodeiko zerbitzaririk gabeko esparruak/plataformak sandbox baldintza guztiak betetzen ditu, baina FaaS funtzioa dinamikoki inplementatzea eta deitzea ez da parkean ibiltzea paseoan
- npm liburutegi batzuek -hala nola [sandbox](https://www.npmjs.com/package/sandbox) eta [vm2](https://www.npmjs.com/package/vm2)- kode isolatua kode lerro bakarrean egikaritzea ahalbidetzen dute. Azken aukera horrek soiltasunean irabazi arren babes mugatua eskaintzen du

### Kode adibidea: Sandbox liburutegia erabiltzea kodea modu isolatuan exekutatzeko

```javascript
const Sandbox = require("sandbox");
const s = new Sandbox();

s.run("lol)hai", (emaitza) => {
  console.log(emaitza);
  //emaitza='Syntax error'
});

// 4 Adibidea - Kode mugatua
s.run("process.platform", (emaitza) => {
  console.log(emaitza);
  //emaitza=Null
});

// 5 Adibidea - Begizta infinitua
s.run("while (true) {}", (emaitza) => {
  console.log(emaitza);
  //emaitza='Timeout'
});
```
