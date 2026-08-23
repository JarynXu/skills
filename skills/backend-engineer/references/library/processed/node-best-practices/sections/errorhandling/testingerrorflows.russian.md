> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/errorhandling/testingerrorflows.russian.md`  
> Upstream Git blob: `3000698817fd65a8fa8202437967ccf6ab2dff3a`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Тестируйте потоки ошибок с использованием вашей любимой тестовой среды

### Объяснение в один абзац

Тестирование "счастливых" путей не лучше, чем тестирование неудач. Хорошее тестирование покрытия кода требует тестирования исключительных путей. В противном случае, нет уверенности, что исключения действительно обрабатываются правильно. Каждая инфраструктура модульного тестирования, например [Mocha](https://mochajs.org/) и [Chai](http://chaijs.com/), поддерживает тестирование исключений (примеры кода ниже). Если вам кажется утомительным тестировать каждую внутреннюю функцию и исключение, вы можете согласиться с тестированием только ошибок HTTP REST API.

### Пример кода: обеспечение правильного исключения с помощью Mocha & Chai

<details>
<summary><strong>Javascript</strong></summary>

```javascript
describe('Facebook chat', () => {
  it('Notifies on new chat message', () => {
    const chatService = new chatService();
    chatService.participants = getDisconnectedParticipants();
    expect(chatService.sendMessage.bind({ message: 'Hi' })).to.throw(ConnectionError);
  });
});
```
</details>

<details>
<summary><strong>Typescript</strong></summary>

```typescript
describe('Facebook chat', () => {
  it('Notifies on new chat message', () => {
    const chatService = new chatService();
    chatService.participants = getDisconnectedParticipants();
    expect(chatService.sendMessage.bind({ message: 'Hi' })).to.throw(ConnectionError);
  });
});
```
</details>

### Пример кода: застрахованное API возвращает правильный код ошибки HTTP

<details>
<summary><strong>Javascript</strong></summary>

```javascript
it('Creates new Facebook group', () => {
  const invalidGroupInfo = {};
  return httpRequest({
    method: 'POST',
    uri: 'facebook.com/api/groups',
    resolveWithFullResponse: true,
    body: invalidGroupInfo,
    json: true
  }).then((response) => {
    expect.fail('if we were to execute the code in this block, no error was thrown in the operation above')
  }).catch((response) => {
    expect(400).to.equal(response.statusCode);
  });
});
```
</details>

<details>
<summary><strong>Typescript</strong></summary>

```typescript
it('Creates new Facebook group', async () => {
  let invalidGroupInfo = {};
  try {
    const response = await httpRequest({
      method: 'POST',
      uri: 'facebook.com/api/groups',
      resolveWithFullResponse: true,
      body: invalidGroupInfo,
      json: true
    })
    // if we were to execute the code in this block, no error was thrown in the operation above
    expect.fail('The request should have failed')
  } catch(response) {
    expect(400).to.equal(response.statusCode);
  }
});
```
</details>
