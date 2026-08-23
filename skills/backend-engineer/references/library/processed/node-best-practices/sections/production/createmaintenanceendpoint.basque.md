> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/createmaintenanceendpoint.basque.md`  
> Upstream Git blob: `1ca7f1556cbac85d12c55b33c2fe95d35d995b47`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Sortu mantentze lanen amaiera puntua

<br/><br/>

### Azalpena

Mantentze lanen amaiera puntua oso HTTP API segurua da, aplikazioaren kodearen parte dena, eta bere helburua da operazioek edo ekoizpen taldeek mantentze funtzionalitatea kontrolatzeko eta erakusteko erabilia izatea. Adibidez, prozesuaren biltegiratzea (memoriaren argazkia) itzul dezake, memoria ihes batzuk dauden ala ez jakinarazi eta REPL komandoak zuzenean exekutatzeko baimena eman dezake. Amaiera hori beharrezkoa da ohiko DevOps tresnek (kontrolagailuak, erregistroak eta abar) ezin dutenean informazio mota zehatz bat bildu edo tresna horiek ez erostea edo ez instalatzea aukeratzen duzunean. Urrezko araua da produkzioa kontrolatzeko eta mantentzeko kanpoko tresna profesionalak erabiltzea, sendoagoak eta zehatzagoak izan ohi dira eta. Hori esanda, litekeena da tresna generikoek atera ezin izatea Noderen edo zure aplikazioren berariazko informaziorik. Adibidez, GC-k ziklo bat burutu duen momentuan memoriaren argazki bat sortu nahi baduzu, npm liburutegi gutxi egongo dira prest lan hori zuretzat egiteko, baina jarraipena egiteko tresna ezagunek funtzionaltasun hori galdu egingo dute. Garrantzitsua da amaiera puntu horren sarbidea mugatzea, administratzaileak soilik sartu ahal izateko, DDOS erasoen jomuga bihur baitaiteke.

<br/><br/>

### Kode adibidea: kodearen bidez pilaketa sorta sortzea

```javascript
const heapdump = require("heapdump");

// Egiaztatu ia eskaera baimendua den
function baimenaDu(req) {
  // ...
}

router.get("/ops/heapdump", (req, res, next) => {
  if (!baimenaDu(req)) {
    return res.status(403).send("Ez duzu baimenik!");
  }

  logger.info("heapdump-a generatzen");

  heapdump.writeSnapshot((err, fitxategiarenIzena) => {
    console.log(
      "heapdump fitxategia prest dago eskariari bidaltzeko",
      fitxategiarenIzena
    );
    fs.readFile(fitxategiarenIzena, "utf-8", (err, data) => {
      res.end(data);
    });
  });
});
```

<br/><br/>

### Gomendatutako baliabideak

[Zure Node.js aplikazioaren ekoizpena prestatzea (diapositibak)](http://naugtur.pl/pres3/node2prod)

▶ [Zure Node.js aplikazioaren ekoizpena prestatzea (bideoa)](https://www.youtube.com/watch?v=lUsNne-_VIk)

![Zure Node.js aplikazioaren ekoizpena prestatzea](../../assets/images/createmaintenanceendpoint1.png "Zure Node.js aplikazioaren ekoizpena prestatzea")
