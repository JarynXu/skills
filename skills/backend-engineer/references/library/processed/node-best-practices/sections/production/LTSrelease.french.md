> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/LTSrelease.french.md`  
> Upstream Git blob: `e4abe1882f6e9099443321492e55510375cf7188`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Utilisez une version LTS de Node.js en production

### Un paragraphe d'explication

Assurez-vous d'utilise une version LTS (Long Term Support) de Node.js en production pour recevoir les corrections de bogues critiques, les mises à jour de sécurité et les améliorations de performance.

Les versions LTS de Node.js sont prises en charge pendant au moins 18 mois et sont indiquées par des numéros de version pairs (par exemple 4, 6, 8). Elles sont idéales pour la production car la ligne de version LTS est axée sur la stabilité et la sécurité, alors que la ligne de version "Current" a une durée de vie plus courte et des mises à jour plus fréquentes du code. Les modifications apportées aux versions LTS se limitent à des corrections de bogues pour la stabilité, des mises à jour de sécurité, d'éventuelles mises à jour npm, des mises à jour de la documentation et certaines améliorations des performances dont il peut être prouvé qu'elles ne nuisent pas aux applications existantes.

<br/><br/>

### A lire

🔗 [Définitions des versions de Node.js](https://nodejs.org/en/about/releases/)

🔗 [Calendrier de diffusion de Node.js](https://github.com/nodejs/Release)

🔗 [Étapes essentielles : Support à long terme (Long Term Support) pour Node.js par Rod Vagg](https://medium.com/@nodesource/essential-steps-long-term-support-for-node-js-8ecf7514dbd)
> ...le calendrier des versions incrémentales de chacune d'entre elles sera déterminé par la disponibilité des corrections de bogues, des corrections de sécurité et d'autres changements, petits mais importants. L'accent sera mis sur la stabilité, mais la stabilité implique également de minimiser le nombre de bogues connus et de rester au fait des problèmes de sécurité au fur et à mesure qu'ils surviennent.

<br/><br/>
