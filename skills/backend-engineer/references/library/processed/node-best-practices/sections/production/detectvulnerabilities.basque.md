> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/detectvulnerabilities.basque.md`  
> Upstream Git blob: `c19b298df21fe5165656787185adc57862649b10`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Erabili menpekotasunak automatikoki atzematen dituzten tresnak

<br/><br/>

### Azalpena

Noderen aplikazio modernoek hamarnaka eta batzuetan ehunaka menpekotasun dituzte. Erabiltzen dituzun menpekotasunen batek segurtasun ahultasun ezaguna badu, zure aplikazioa ere ahula da.
Tresna hauek automatikoki egiaztatzen dituzte zure menpekotasunetako segurtasun ahultasunak:

- [npm audit](https://docs.npmjs.com/cli/audit) - npm auditoria
- [snyk](https://snyk.io/) - etengabe bilatu eta konpondu ahultasunak zure menpekotasunetan

<br/><br/>

### Beste blogari batzuek diotena

[StrongLoop](https://strongloop.com/strongblog/best-practices-for-express-in-production-part-one-security/) bloga:

> ...Zure aplikazioaren menpekotasunak kudeatzeko erabiltzea indartsua eta erosoa da. Erabiltzen dituzun paketeek zure aplikazioan ere eragina izan dezaketen segurtasun ahultasun larriak izan ditzakete. Zure aplikazioaren segurtasuna zure menpekotasunen "esteka ahulena" bezain sendoa da. Zorionez, bi tresna lagungarri daude erabiltzen dituzun hirugarren paketeak ziurtatzeko erabil ditzakezunak: nsp eta requireSafe. Bi tresna horiek gauza bera egiten dute neurri handi batean. Beraz, biak erabiltzea gehiegizkoa izan badaiteke ere, "hobe seguru jokatzea, damutzea baino". Hitz horiek, segurtasunari dagokionez, zuzenak eta egokiak dira...
