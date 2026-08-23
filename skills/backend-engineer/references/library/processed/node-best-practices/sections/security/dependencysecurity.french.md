> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/dependencysecurity.french.md`  
> Upstream Git blob: `b625e55ccf73546e63d9b692bcfd4a02d1259a55`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Inspectez constamment et automatiquement les dépendances vulnérables

### Un paragraphe d'explication

La majorité des applications Node.js pour des raisons de facilité et de rapidité de développement reposent largement sur un grand nombre de modules tiers de npm ou de Yarn, deux registres de paquets populaires. Cependant, l'inconvénient de cet avantage est le risque d'inclure des vulnérabilités inconnues dans votre application, risque reconnu par son classement dans la liste des principaux risques de sécurité des applications web critiques de l'OWASP.

Il existe un certain nombre d'outils disponibles pour aider à identifier les paquets tiers dans les applications Node.js qui ont été identifiés comme vulnérables par la communauté afin d'atténuer le risque de les introduire dans votre projet. Ceux-ci peuvent être utilisés périodiquement à partir des outils CLI ou inclus dans le cadre du processus de construction de votre application.

### Table des matières

- [NPM audit](#npm-audit)
- [Snyk](#snyk)
- [Greenkeeper](#greenkeeper)
- [Ressources complémentaires](#ressources-complémentaires)

### NPM Audit

`npm audit` est un nouvel outil cli introduit avec NPM@6.

L'exécution de `npm audit` produira un rapport des vulnérabilités de sécurité avec le nom du paquet affecté, la gravité et la description de la vulnérabilité, le chemin et d'autres informations, et si disponibles, des commandes pour appliquer des correctifs pour résoudre les vulnérabilités.

![exemple npm audit](../../assets/images/npm-audit.png)

🔗 [A lire : NPM blog](https://docs.npmjs.com/getting-started/running-a-security-audit)

### Snyk

Snyk propose une CLI riche en fonctionnalités, ainsi qu'une intégration dans GitHub. Snyk va plus loin dans cette démarche et en plus de notifier les vulnérabilités, il crée automatiquement de nouvelles pull requests corrigeant les vulnérabilités au fur et à mesure que des correctifs sont publiés pour des vulnérabilités connues.

Le site web riche en fonctionnalités de Snyk permet également une évaluation adéquate des dépendances lorsqu'il est associé avec un dépôt GitHub ou une URL de module npm. Vous pouvez également rechercher directement les paquets npm qui présentent des vulnérabilités.

Un exemple d'affichage de l'intégration de Snyk avec GitHub qui crée automatiquement un pull request :
![exemple GitHub avec snyk](../../assets/images/snyk.png)

🔗 [A lire : Site web de Snyk](https://snyk.io/)

🔗 [A lire : Outil en ligne Synk pour vérifier les paquets npm et les modules GitHub](https://snyk.io/test)

### Greenkeeper

Greenkeeper est un service qui propose des mises à jour de dépendances en temps réel, ce qui permet de garder une application plus sûre en utilisant toujours les versions de dépendances les plus récentes et les plus corrigées.

Greenkeeper surveille les dépendances npm spécifiées dans le fichier `package.json` d'un dépôt et crée automatiquement une branche de travail avec chaque mise à jour de dépendance. La suite CI du dépôt est ensuite exécutée pour révéler les changements de rupture de la version de dépendance mise à jour dans l'application. Si le CI échoue en raison de la mise à jour des dépendances, une issue claire et concise est créée dans le dépôt pour être traitée, décrivant les versions actuelles et mises à jour du paquet, ainsi que les informations et l'historique des commits de la version mise à jour.

Un exemple d'affichage de l'intégration de Greenkeeper avec GitHub qui crée automatiquement un pull request :

![exemple Github avec Greenkeeper](../../assets/images/greenkeeper.png)
🔗 [A lire : Site web de Greenkeeper](https://greenkeeper.io/)

### Ressources complémentaires

🔗 [Blog de Rising Stack : Risques de dépendance de Node.js](https://blog.risingstack.com/controlling-node-js-security-risk-npm-dependencies/)

🔗 [Blog de NodeSource : Améliorez la sécurité de npm](https://nodesource.com/blog/how-to-reduce-risk-and-improve-security-around-npm)
