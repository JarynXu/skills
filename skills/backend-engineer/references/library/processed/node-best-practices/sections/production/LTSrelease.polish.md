> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/LTSrelease.polish.md`  
> Upstream Git blob: `6382b5e5a126dbcc0b87e0d20a0c751acc8480e8`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Użyj wersji LTS Node.js w produkcji

### Wyjaśnienie jednym akapitem

Upewnij się, że korzystasz z wersji LTS (Long Term Support) Node.js w produkcji, aby otrzymywać krytyczne poprawki błędów, aktualizacje zabezpieczeń i ulepszenia wydajności.

Wersje Lode Node.js są obsługiwane przez co najmniej 18 miesięcy i są oznaczone parzystymi numerami wersji (np. 4, 6, 8). Najlepiej nadają się do produkcji, ponieważ linia wydania LTS koncentruje się na stabilności i bezpieczeństwie, podczas gdy linia wydania „Bieżąca” ma krótszą żywotność i częstsze aktualizacje kodu. Zmiany w wersjach LTS ograniczają się do poprawek błędów dotyczących stabilności, aktualizacji bezpieczeństwa, możliwych aktualizacji npm, aktualizacji dokumentacji i pewnych ulepszeń wydajności, które można wykazać, aby nie powodować awarii istniejących aplikacji.

<br/><br/>

### Czytaj

🔗 [Node.js release definitions](https://nodejs.org/en/about/releases/)

🔗 [Node.js release schedule](https://github.com/nodejs/Release)

🔗 [Essential Steps: Long Term Support for Node.js by Rod Vagg](https://medium.com/@nodesource/essential-steps-long-term-support-for-node-js-8ecf7514dbd)
> ...the schedule of incremental releases within each of these will be driven by the availability of bug fixes, security fixes, and other small but important changes. The focus will be on stability, but stability also includes minimizing the number of known bugs and staying on top of security concerns as they arise.

<br/><br/>
