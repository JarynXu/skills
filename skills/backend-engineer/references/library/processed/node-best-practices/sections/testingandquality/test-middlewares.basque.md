> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/testingandquality/test-middlewares.basque.md`  
> Upstream Git blob: `6457223e7797acc24db0328d212bfb332306e163`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Probatu zure middlewareak eurak bakarrik

<br/><br/>

### Azalpena

Askok middlewarearen probak alde batera uzten dituzte sistemaren zati txiki bat adierazten dutelako eta zuzeneko Express zerbitzaria edukitzea behar dutelako. Bi arrazoi horiek okerrak dira: middlewareak txikiak dira, baina eskaera guztiei edo gehienei eragiten diete, eta erraz probatu daitezke {req,res} JS objektuak berreskuratzen dituzten funtzio huts gisa. Middleware funtzioak probatzeko, norberak funtzioa deitu behar du eta {req,res} objektuekin dagoen elkarrekintza espiatu (spy) ([erabili Sinon adibide gisa](https://www.npmjs.com/package/sinon)), funtzioak ekintza zuzena egin duela ziurtatzeko. [node-mock-http](https://www.npmjs.com/package/node-mocks-http) liburutegia oraindik ere urrutiago doa eta {req,res} objektuak faktorizatzen ditu beraien jokaera espiatuz. Adibidez, res objektuan zehaztutako http estatus bat espero den balioarekin bat datorren baiezta dezake (ikusi beheko adibidea)

<br/><br/>

### Kode adibidea: probatu zure middlewarea bera bakarrik

```javascript
//probatu nahi dugun middlewarea
const probapeanDagoenUnitatea = require("./middleware");
const httpMocks = require("node-mocks-http");
//Jest sintaxisa, Mochako describe() eta it()en baliokidea
test("Autentikazio goiburu gabeko eskaera, 403 http estatus bat bueltatu beharko luke", () => {
  const request = httpMocks.createRequest({
    method: "GET",
    url: "/user/42",
    headers: {
      authentication: ""
    }
  });
  const erantzuna = httpMocks.createResponse();
  probapeanDagoenUnitatea(request, response);
  expect(erantzuna.statusCode).toBe(403);
});
```
