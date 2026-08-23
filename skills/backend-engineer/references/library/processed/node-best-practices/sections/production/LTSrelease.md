> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/LTSrelease.md`  
> Upstream Git blob: `de219406609c7b4e1e1163ccf2a533b720198017`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Use an LTS release of Node.js in production

### One Paragraph Explainer

Ensure you are using an LTS(Long Term Support) version of Node.js in production to receive critical bug fixes, security updates and performance improvements.

LTS versions of Node.js are supported for at least 18 months and are indicated by even version numbers (e.g. 4, 6, 8). They're best for production since the LTS release line is focussed on stability and security, whereas the 'Current' release line has a shorter lifespan and more frequent updates to the code. Changes to LTS versions are limited to bug fixes for stability, security updates, possible npm updates, documentation updates and certain performance improvements that can be demonstrated to not break existing applications.

<br/><br/>

### Read on

🔗 [Node.js release definitions](https://nodejs.org/en/about/releases/)

🔗 [Node.js release schedule](https://github.com/nodejs/Release)

🔗 [Essential Steps: Long Term Support for Node.js by Rod Vagg](https://medium.com/@nodesource/essential-steps-long-term-support-for-node-js-8ecf7514dbd)
> ...the schedule of incremental releases within each of these will be driven by the availability of bug fixes, security fixes, and other small but important changes. The focus will be on stability, but stability also includes minimizing the number of known bugs and staying on top of security concerns as they arise.

<br/><br/>
