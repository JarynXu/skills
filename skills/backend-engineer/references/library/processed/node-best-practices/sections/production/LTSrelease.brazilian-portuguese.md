> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/production/LTSrelease.brazilian-portuguese.md`  
> Upstream Git blob: `b132451f4ed7075d85b7a45c1acc1597959afd84`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Use uma versão LTS do Node.js em produção

### Explicação em um Parágrafo

Verifique se você está usando uma versão LTS (Long Term Support) do Node.js em produção para receber correções de bugs críticos, atualizações de segurança e melhorias de desempenho.

As versões LTS do Node.js são suportadas por pelo menos 18 meses e são indicadas por números de versão pares (por exemplo, 4, 6, 8). Eles são melhores para produção, já que a linha de lançamento LTS é focada em estabilidade e segurança, enquanto a linha de lançamento 'Atual' tem uma vida útil mais curta e atualizações mais frequentes no código. As alterações nas versões LTS estão limitadas a correções de bugs para estabilidade, atualizações de segurança, possíveis atualizações npm, atualizações de documentação e certos aprimoramentos de desempenho que podem ser demonstrados para não interromper aplicações. existentes.

<br/><br/>

### Leia em

🔗 [Definições de lançamento do Node.js](https://nodejs.org/en/about/releases/)

🔗 [Agenda de lançamento do Node.js](https://github.com/nodejs/Release)

🔗 [Etapas Essenciais: Suporte de Longo Prazo para o Node.js por Rod Vagg](https://medium.com/@nodesource/essential-steps-long-term-support-for-node-js-8ecf7514dbd)
> ...o cronograma de lançamentos incrementais dentro de cada um deles será impulsionado pela disponibilidade de correções de bugs, correções de segurança e outras pequenas, mas importantes, alterações. O foco será na estabilidade, mas a estabilidade também inclui a minimização do número de bugs conhecidos e a manutenção das preocupações de segurança à medida que elas surgem.

<br/><br/>
