> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/detectvulnerabilities.polish.md`  
> Upstream Git blob: `d089f91c37db226f6874df98146346e4661c1a03`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Użyj narzędzi, które automatycznie wykrywają podatne na zagrożenia zależności

<br/><br/>

### Wyjaśnienie jednym akapitem

Nowoczesne aplikacje Node mają dziesiątki, a czasem setki zależności. Jeśli którakolwiek z zależności, z której korzystasz
ma znaną lukę w zabezpieczeniach, Twoja aplikacja też.
Następujące narzędzia automatycznie sprawdzają znane luki bezpieczeństwa w twoich zależnościach:

- [npm audit](https://docs.npmjs.com/cli/audit) - npm audit
- [snyk](https://snyk.io/) - Ciągle znajduj i usuwaj luki w swoich zależnościach

<br/><br/>

### Co mówią inni blogerzy

Z  bloga [StrongLoop](https://strongloop.com/strongblog/best-practices-for-express-in-production-part-one-security/):

> ...Using to manage your application’s dependencies is powerful and convenient. But the packages that you use may contain critical security vulnerabilities that could also affect your application. The security of your app is only as strong as the “weakest link” in your dependencies. Fortunately, there are two helpful tools you can use to ensure the third-party packages you use: nsp and requireSafe. These two tools do largely the same thing, so using both might be overkill, but “better safe than sorry” are words to live by when it comes to security...
