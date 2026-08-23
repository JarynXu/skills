> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/secureheaders.french.md`  
> Upstream Git blob: `547cbf13829ee08bd12517309642f67e1d487ea4`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Utilisation des entêtes de sécurité pour sécuriser votre application contre les attaques communes

<br/><br/>


### Un paragraphe d'explication

Des entêtes de sécurité sont utilisés pour sécuriser davantage votre application. Les entêtes les plus importants sont énumérés ci-dessous. Vous pouvez également visiter les sites liés au bas de cette page pour obtenir plus d'informations sur ce sujet. Vous pouvez facilement définir ces entêtes en utilisant le module [Helmet](https://www.npmjs.com/package/helmet) pour Express ([Helmet pour koa](https://www.npmjs.com/package/koa-helmet)).

<br/><br/>

### Table des matières
- [Sécurité stricte des transports HTTP (HTTP Strict Transport Security : HSTS)](#sécurité-stricte-des-transports-http-http-strict-transport-security-hsts)
- [Épinglage de clé publique HTTP (Public Key Pinning for HTTP : HPKP)](#épinglage-de-clé-publique-HTTP-public-key-pinning-for-http-hpkp)
- [X-Frame-Options](#x-frame-options)
- [X-XSS-Protection](#x-xss-protection)
- [X-Content-Type-Options](#x-content-type-options)
- [Referrer-Policy](#referrer-policy)
- [Expect-CT](#expect-ct)
- [Content-Security-Policy](#content-security-policy)
- [Ressources complémentaires](#ressources-complémentaires)

<br/><br/>

### Sécurité stricte des transports HTTP (HTTP Strict Transport Security : HSTS)

Le HTTP Strict Transport Security (HSTS) est un mécanisme de sécurité du web qui protège les sites web contre les [attaques par repli](https://fr.wikipedia.org/wiki/Attaque_par_repli) et le [détournement de cookies](https://www.owasp.org/index.php/Session_hijacking_attack). Il permet aux serveurs web de déclarer que les navigateurs web (ou autres agents utilisateurs conformes) ne doivent interagir avec lui qu'en utilisant des __connexions HTTPS sécurisées__ et __jamais__ via le protocole HTTP non sécurisé. La politique HSTS est mise en œuvre en utilisant l'entête `Strict-Transport-Security` sur une connexion HTTPS existante.

L'entête Strict-Transport-Security accepte une valeur `max-age` en secondes, pour indiquer au navigateur combien de temps il doit accéder au site en utilisant uniquement le HTTPS, et une valeur `includeSubDomains` pour appliquer la règle Strict-Transport-Security à tous les sous-domaines du site.

Exemple d'entête - Politique HSTS activée pendant une semaine, incluant les sous-domaines
```
Strict-Transport-Security: max-age=2592000; includeSubDomains
```

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#hsts)

🔗 [A lire sur la doc web de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

<br/><br/>

### Épinglage de clé publique HTTP (Public Key Pinning for HTTP : HPKP)

Le HTTP Public Key Pinning (HPKP) est un mécanisme de sécurité permettant aux sites Web HTTPS de résister à l'usurpation d'identité par des attaquants utilisant des certificats SSL/TLS mal émis ou autrement frauduleux.

Le serveur Web HTTPS diffuse une liste de hachages de clés publiques et lors des connexions suivantes, les clients s'attendent à ce que ce serveur utilise une ou plusieurs de ces clés publiques dans sa chaîne de certificats. En utilisant cette fonctionnalité avec précaution, vous pouvez réduire considérablement le risque d'attaques de type « man-in-the-middle » (MITM) et d'autres faux problèmes d'authentification pour les utilisateurs de votre application sans encourir de risques inutiles.

Avant de le mettre en œuvre, vous devriez d'abord jeter un œil à l'entête `Expect-CT`, en raison de sa flexibilité avancée pour la récupération après une mauvaise configuration et bien d'autres [avantages](https://groups.google.com/a/chromium.org/forum/m/#!msg/blink-dev/he9tr7p3rZ8/eNMwKPmUBAAJ).

L'entête Public-Key-Pins accepte 4 valeurs, une valeur `pin-sha256` pour ajouter la clé publique du certificat, hachée à l'aide de l'algorithme SHA256, qui peut être ajoutée plusieurs fois pour différentes clés publiques, une valeur `max-age` pour indiquer au navigateur combien de temps il doit appliquer la règle, une valeur `includeSubDomains` pour appliquer cette règle à tous les sous-domaines et une valeur `report-uri` pour signaler les échecs de validation du pin vers l'URL donnée.

Exemple d'entête - Politique HPKP activée pendant une semaine, incluant des sous-domaines, signalant les échecs vers un exemple d'URL et autorisant deux clés publiques
```
Public-Key-Pins: pin-sha256="d6qzRu9zOECb90Uez27xWltNsj0e1Md7GkYYkVoZWmM="; pin-sha256="E9CZ9INDbd+2eRQozYqqbQ2yXLVKB9+xcprMF+44U1g="; report-uri="http://example.com/pkp-report"; max-age=2592000; includeSubDomains
```

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#hpkp)

🔗 [A lire sur la doc web de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning)

<br/><br/>

### X-Frame-Options

L'entête X-Frame-Options protège l'application contre les attaques de type [Clickjacking] (https://www.owasp.org/index.php/Clickjacking) en indiquant si votre application peut être intégrée à d'autres pages (externes) à l'aide de frames.

X-Frame-Options accepte 3 paramètres, un paramètre `deny` pour interdire l'intégration de la ressource en général, un paramètre `sameorigin` pour permettre l'intégration de la ressource sur le même hôte/origine et un paramètre `allow-from` pour spécifier un hôte où l'intégration de la ressource est autorisée.

Exemple d'entête - Refuse une incorporation dans votre application
```
X-Frame-Options: deny
```

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xfo)

🔗 [A lire sur la doc web de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

<br/><br/>

### X-XSS-Protection

Cet entête active le filtre [Cross-site scripting](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)) dans votre navigateur.

Elle accepte 4 paramètres, `0` pour désactiver le filtre, `1` pour activer le filtre et permettre le nettoyage automatique de la page, `mode=block` pour activer le filtre et empêcher le rendu de la page si une attaque XSS est détectée (ce paramètre doit être ajouté au `1` en utilisant un point-virgule, et `report=<domainToReport>` pour signaler la violation (ce paramètre doit être ajouté au `1`).

Exemple d'entête - Activer la protection XSS et signale les violations vers l'URL d'exemple
```
X-XSS-Protection: 1; report=http://example.com/xss-report
```

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xxxsp)

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)

<br/><br/>

### X-Content-Type-Options

La définition de cet entête empêchera le navigateur d'[interpréter les fichiers comme quelque chose d'autre](https://en.wikipedia.org/wiki/Content_sniffing) que celui déclaré par le type de contenu dans les entêtes HTTP.

Exemple d'entête - Interdiction de scanner le contenu
```
X-Content-Type-Options: nosniff
```

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xcto)

🔗 [A lire sur la doc web de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)


<br/><br/>

### Referrer-Policy

L'entête HTTP Referrer-Policy détermine quelles informations de référent, envoyées dans l'entête `Referer`, doivent être incluses avec les requêtes effectuées.

Elle accepte 8 paramètres, un paramètre `no-referrer` pour supprimer complètement l'entête `Referer`, un paramètre `no-referrer-when-downgrade` pour supprimer l'entête `Referer` lors d'une dégradation par exemple HTTPS -> HTTP, un paramètre `origin` pour envoyer l'origine de l'hôte (la racine de l'hôte) en tant que référent __uniquement__, un paramètre `origin-when-cross-origin` pour envoyer une URL d'origine complète lorsque l'on reste sur la même origine et pour envoyer l'origine de l'hôte __uniquement__ dans le cas contraire, un paramètre `same-origin` pour envoyer des informations de référent uniquement pour les origines du même site et pour omettre les requêtes de destination croisée (cross-origin), un paramètre `strict-origin` pour ne conserver l'entête `Referer` que sur le même niveau de sécurité (HTTPS -> HTTPS) et l'omettre sur une destination moins sûre, un paramètre `strict-origin-when-cross-origin` pour envoyer l'URL référent complète à une destination de même origine, l'origine __uniquement__ vers une destination croisée au __même__ niveau de sécurité et aucun référent sur une destination croisée moins sûre et enfin un paramètre `unsafe-url` pour envoyer le référent complet vers des destinations de même origine ou croisées.

Exemple d'entête - Supprime complètement l'entête `Referer`
```
Referrer-Policy: no-referrer
```

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#rp)

🔗 [A lire sur la doc web de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)


<br/><br/>

### Expect-CT

L'entête Expect-CT est utilisé par un serveur pour indiquer que les navigateurs doivent examiner les connexions à l'hôte émettant l'entête pour respecter la technologie [Certificate Transparency](https://www.certificate-transparency.org/).

Cet entête accepte 3 paramètres, un paramètre `report-uri` pour fournir une URL à utiliser afin de signaler les échecs de Expect-CT, un paramètre `enforce` pour signaler au navigateur que la technologie _Certificate Transparency_ doit être appliquée (plutôt que de se contenter de la signaler) et refuser les futures connexions violant la technologie _Certificate Transparency_ et un paramètre `max-age` pour spécifier le nombre de secondes pendant lesquelles le navigateur considère l'hôte comme un hôte Expect-CT connu.

Exemple d'entête - Fait respecter la technologie _Certificate Transparency_ pendant une semaine et transmet une URL d'exemple pour le signalement
```
Expect-CT: max-age=2592000, enforce, report-uri="https://example.com/report-cert-transparency"
```

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#ect)


<br/><br/>

### Content-Security-Policy

L'entête de réponse HTTP Content-Security-Policy permet de contrôler les ressources que l'agent utilisateur est autorisé à charger pour une page donnée. À quelques exceptions près, les stratégies impliquent principalement de spécifier l'origine des serveurs et les points de terminaison des scripts. Cela permet de se prémunir contre les [attaques de script intersites (XSS)](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)).

Exemple d'entête - Active le CSP et n'exécute que des scripts depuis la même origine
```
Content-Security-Policy: script-src 'self'
```

Il existe de nombreuses politiques activées avec Content-Security-Policy qui peuvent être trouvées sur les sites liés ci-dessous.

🔗 [A lire sur le projet des entêtes sécurisés de OWASP](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#csp)

🔗 [A lire sur la doc web de MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)


<br/><br/>

### Ressources complémentaires

🔗 [OWASP Projet d'entêtes sécurisés](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#tab=Headers)

🔗 [Node.js Liste de contrôle de sécurité (RisingStack)](https://blog.risingstack.com/node-js-security-checklist/)


<br/><br/>
