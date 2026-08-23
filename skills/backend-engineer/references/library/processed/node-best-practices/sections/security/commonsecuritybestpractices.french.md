> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/commonsecuritybestpractices.french.md`  
> Upstream Git blob: `c9bcac3716661717f94009d3edb912f1311be50a`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[✔]: ../../assets/images/checkbox-small-blue.png

# Meilleures pratiques de sécurité communes avec Node.js

La section des directives de sécurité communes contient les meilleures pratiques qui sont normalisées dans de nombreux frameworks et conventions. L'utilisation d'une application avec SSL/TLS, par exemple, devrait être une directive et une convention commune suivie dans chaque configuration pour obtenir des grands avantages en matière de sécurité.

## ![✔] Utilisez SSL/TLS pour crypter la connexion client-serveur

**TL;PL :** À l'heure des [certificats SSL/TLS gratuits](https://letsencrypt.org/) et de la facilité de leur configuration, vous n'avez plus à peser les avantages et les inconvénients de l'utilisation d'un serveur sécurisé car les avantages tels que la sécurité, le support de la technologie moderne et de la confiance l'emportent clairement sur les inconvénients tels que la surcharge minimale par rapport au HTTP pur.

**Autrement :** Les attaquants peuvent effectuer des attaques de type "attaque de l'homme du milieu", espionner le comportement de vos utilisateurs et effectuer des actions encore plus malveillantes lorsque la connexion n'est pas cryptée.

🔗 [**Plus d'infos : exécution d'un serveur Node.js sécurisé**](./secureserver.french.md)

<br/><br/>

## ![✔] Comparez les valeurs secrètes et les hachages en toute sécurité

**TL;PL :** Lorsque vous comparez des valeurs secrètes ou des hachages comme les digests HMAC, vous devez utiliser la fonction [`crypto.timingSafeEqual(a, b)`](https://nodejs.org/dist/latest-v9.x/docs/api/crypto.html#crypto_crypto_timingsafeequal_a_b) que Node fournit dès la version 6.6.0 de Node.js. Cette méthode compare deux objets donnés et continue de comparer même si les données ne correspondent pas. Les méthodes de comparaison d'égalité par défaut s'arrêteraient simplement après une discordance de caractères, permettant de chronométrer les attaques basées sur la longueur de l'opération.

**Autrement :** En utilisant les opérateurs de comparaison d'égalité par défaut, vous pourriez exposer des informations critiques basées sur le temps nécessaire pour comparer deux objets.

<br/><br/>

## ![✔] Génération de chaînes aléatoires à l'aide de Node.js

**TL;PL :** L'utilisation d'une fonction personnalisée générant des chaînes pseudo-aléatoires pour les jetons et autres cas d'utilisation sensibles à la sécurité pourrait en fait ne pas être aussi aléatoire que vous le pensez, rendant votre application vulnérable aux attaques cryptographiques. Lorsque vous devez générer des chaînes aléatoires sécurisées, utilisez la fonction [`crypto.randomBytes(size, [callback])`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) en utilisant l'entropie disponible fournie par le système.

**Autrement :** Lors de la génération de chaînes pseudo-aléatoires sans recourir à des méthodes cryptographiques sûres, les pirates peuvent prévoir et reproduire les résultats générés, ce qui rend votre application peu sûre.

<br/><br/>

Nous avons énuméré ci-dessous quelques conseils importants tirés du projet OWASP.

## ![✔] OWASP A2 : Authentification frauduleuse

- Exigez MFA/2FA pour les services et comptes importants
- Changez fréquemment les mots de passe et les clés d'accès, y compris les clés SSH
- Appliquez des politiques strictes en matière de mots de passe, tant pour l'exploitation que pour la gestion des utilisateurs dans l'application ([🔗 OWASP recommandation sur le mot de passe](https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Implement_Proper_Password_Strength_Controls.22))
- N'envoyez ou ne déployez pas votre application avec des identifiants par défaut, en particulier pour les utilisateurs de l'administration ou les services externes dont vous dépendez
- Utilisez uniquement des méthodes d'authentification standard comme OAuth, OpenID, etc, **évitez** l'authentification de base
- Limitez le taux d'authentification : interdisez plus de _X_ tentatives de connexion (y compris la récupération du mot de passe, etc.) pendant une période _Y_.
- En cas d'échec de la connexion, n'indiquez pas à l'utilisateur si la vérification du nom d'utilisateur ou du mot de passe a échoué, mais renvoyez simplement une erreur d'authentification ordinaire.
- Envisagez d'utiliser un système de gestion des utilisateurs centralisé pour éviter de gérer plusieurs comptes par employé (par exemple GitHub, AWS, Jenkins, etc.) et pour bénéficier d'un système de gestion des utilisateurs éprouvé

## ![✔] OWASP A5 : Contrôle d'accès défectueux

- Respectez le [principe de moindre privilège](https://fr.wikipedia.org/wiki/Principe_de_moindre_privil%C3%A8ge)  -  chaque composant et chaque personne du DevOps ne doit avoir accès qu'aux informations et ressources nécessaires
- **Ne travaillez jamais** avec le compte console/root (privilège total) sauf pour la gestion de compte
- Exécutez toutes les instances/conteneurs sous le nom d'un compte de rôle/service
- Attribuez des autorisations à des groupes et non à des utilisateurs. Cela devrait rendre la gestion des permissions plus facile et plus transparente dans la plupart des cas

## ![✔] OWASP A6 : Mauvaise configuration de la sécurité

- L'accès à l'environnement interne de production se fait uniquement par le réseau interne, en utilisant SSH ou d'autres moyens, mais _n'exposez jamais_ les services internes
- Restreignez l'accès au réseau interne - définissez explicitement quelle ressource peut accéder à quelles autres ressources (par exemple, la politique du réseau ou des sous-réseaux)
- Si vous utilisez des cookies, configurez-les en mode « sécurisés » afin qu'ils soient envoyés uniquement via SSL
- Si vous utilisez des cookies, configurez-les uniquement pour un « même site » afin que seules les requêtes provenant d'un même domaine puissent récupérer les cookies indiqués.
- Si vous utilisez des cookies, préférez une configuration « HttpOnly » qui empêche le code JavaScript côté client d'accéder aux cookies
- Protégez chaque VPC par des règles d'accès strictes et restrictives
- Priorisez les menaces en utilisant n'importe quel modèle standard de menace de sécurité comme STRIDE ou DREAD
- Protégez-vous contre les attaques DDoS à l'aide d'équilibreurs de charge HTTP(S) et TCP
- Effectuez des tests de pénétration périodiques par des agences spécialisées

## ![✔] OWASP A3 : Exposition des données sensibles

- N'acceptez que les connexions SSL/TLS, appliquez Strict-Transport-Security en utilisant les entêtes
- Séparez le réseau en segments (c'est-à-dire sous-réseaux) et assurez-vous que chaque nœud dispose uniquement des autorisations d'accès nécessaires au réseau
- Regroupez tous les services/instances qui n'ont pas besoin d'accès à internet et interdisez explicitement toute connexion sortante (un sous-réseau privé)
- Stockez tous les secrets dans un coffre-fort, des produits comme AWS KMS, HashiCorp Vault ou Google Cloud KMS
- Verrouillez les métadonnées d'instance sensibles à l'aide de métadonnées
- Cryptez les données en transit lorsqu'elles quittent une frontière physique
- N'incluez pas de secrets dans les instructions de journal
- Évitez d'afficher des mots de passe en clair dans le frontend, prenez les mesures nécessaires dans le backend et ne stockez jamais d'informations sensibles en clair

## ![✔] OWASP A9 : Utilisation de composants avec des vulnérabilités de sécurité connues

- Analysez les images des dockers à la recherche de vulnérabilités connues (en utilisant les services d'analyse de Docker et d'autres fournisseurs)
- Activez les correctifs et les mises à jour automatiques des instances (machines) pour éviter d'utiliser des versions de systèmes d'exploitation anciennes qui ne disposent pas de correctifs de sécurité
- Fournissez à l'utilisateur les jetons « id », « access » et « refresh » afin que le jeton d'accès soit de courte durée et renouvelé avec le jeton « refresh »
- Enregistrez et auditerz chaque appel d'API vers les services de gestion et de cloud (par exemple, qui a supprimé le compartiment S3 ?) en utilisant des services comme AWS CloudTrail
- Exécutez le contrôle de sécurité de votre fournisseur de services en ligne (par exemple, le conseiller en sécurité de AWS)


## ![✔] OWASP A10 : Journalisation et surveillance insuffisantes

- Alertez sur les événements d'audit significatifs ou suspects tels que la connexion d'un utilisateur, la création d'un nouvel utilisateur, le changement d'autorisation, etc.
- Alertez sur le nombre irrégulier d'échecs de connexion (ou actions équivalentes comme l'oubli du mot de passe)
- Indiquez l'heure et le nom de l'utilisateur qui a initié la mise à jour dans chaque enregistrement de la base de données

## ![✔] OWASP A7 : Cross-Site-Scripting (XSS)

- Utilisez des moteurs ou des frameworks de template qui échappent automatiquement le XSS par leur conception, comme EJS, Pug, React ou Angular. Apprenez les limites de chaque mécanisme de protection XSS et traiter de manière appropriée les cas d'utilisation qui ne sont pas couverts
- Échappez les données de requête HTTP non fiables en fonction du contexte dans la sortie HTML (corps, attribut, JavaScript, CSS ou URL) résoudra les vulnérabilités XSS reflétées et stockées
- L'application d'un encodage contextuel lors de la modification du document du navigateur côté client agit contre DOM XSS
- Permettez une politique de sécurité des contenus (CSP) comme défense en profondeur pour atténuer le contrôle contre les XSS

## ![✔] Protégez les informations personnelles identifiables (données PII)

- Les informations personnelles identifiables (PII : Personally identifiable information) sont toutes les données qui peuvent être utilisées pour identifier une personne spécifique
- Protégez les informations personnelles identifiables dans les applications en les cryptant
- Respectez les lois du pays en matière de protection des données. Lois de référence :
  - Union européenne : RGPD - https://ec.europa.eu/info/law/law-topic/data-protection_fr
  - Inde : https://meity.gov.in/writereaddata/files/Personal_Data_Protection_Bill,2018.pdf
  - Singapour : https://www.pdpc.gov.sg/Overview-of-PDPA/The-Legislation/Personal-Data-Protection-Act

## ![✔] Avoir un fichier security.txt [PRODUCTION]

**TL;PL :** Ayez un fichier texte appelé ```security.txt``` sous le répertoire ```/.well-known``` (/.well-known/security.txt) ou dans le répertoire racine (/security.txt) de votre site web ou de votre application web en production. Le fichier ```security.txt``` doit contenir les détails permettant aux chercheurs en sécurité de signaler des vulnérabilités, ainsi que les coordonnées de la personne/du groupe responsable (adresse électronique et/ou numéros de téléphone) à qui les rapports doivent être envoyés.

**Autrement :** Il se peut que vous ne soyez pas informé des vulnérabilités. Vous manquerez l'occasion d'agir à temps sur les vulnérabilités.

🔗 [**Plus d'infos : security.txt**](https://securitytxt.org/)
<br/><br/><br/>

## ![✔] Avoir un fichier SECURITY.md [OPEN SOURCE]

**TL;PL :** Pour donner aux gens des instructions pour signaler de manière responsable les vulnérabilités de sécurité dans votre projet, vous pouvez ajouter un fichier SECURITY.md file à la racine de votre dépôt, dans le dossier docs ou .github. Le fichier SECURITY.md doit contenir les détails permettant aux chercheurs en sécurité de signaler les vulnérabilités, ainsi que les coordonnées de la personne/du groupe responsable (adresse électronique et/ou numéros de téléphone) à qui les rapports doivent être envoyés.

**Autrement :** Il se peut que vous ne soyez pas informé des vulnérabilités. Vous manquerez l'occasion d'agir à temps sur les vulnérabilités.

🔗 [**Plus d'infos : SECURITY.md**](https://help.github.com/en/github/managing-security-vulnerabilities/adding-a-security-policy-to-your-repository)

<br/><br/><br/>


<br/><br/><br/>
