> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/safemoduleloading.french.md`  
> Upstream Git blob: `0c2c4e49fd1541d8908cce59c061e4f69fcecf68`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Avoid module loading using a variable

### One Paragraph Explainer

Avoid requiring/importing another file with a path that was given as parameter due to the concern that it could have originated from user input. This rule can be extended for accessing files in general (i.e. `fs.readFile()`) or other sensitive resources with dynamic variables originating from user input.

### Code example

```javascript
// insecure, as helperPath variable may have been modified by user input
const badWayToRequireUploadHelpers = require(helperPath);

// secure
const uploadHelpers = require('./helpers/upload');
```
