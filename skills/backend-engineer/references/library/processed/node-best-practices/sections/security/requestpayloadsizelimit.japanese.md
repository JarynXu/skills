> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/requestpayloadsizelimit.japanese.md`  
> Upstream Git blob: `cd0deb041cf3ae6a32f30204d8ad45e67cc00912`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# リバースプロキシまたはミドルウェアを使用してペイロードのサイズを制限する

### 一段落説明

JSON でエンコードされたペイロードなどのリクエストボディのパースは、特に大きなリクエストの場合、パフォーマンス的に重い処理となります。
ウェブアプリケーションでリクエストを処理する際は、それぞれのペイロードのサイズを制限するべきです。
サイズ無制限のボディ/ペイロードを含むリクエストを受任すると、アプリケーションのパフォーマンス著しく悪化したり、サービス停止に陥ったり、そのほか望まない副作用のためにクラッシュする恐れがあります。
express に含まれている `body-parser` パッケージのような、リクエストボディを解析するための多くの一般的なミドルウェアソリューションは、
リクエストペイロードのサイズを制限するオプションを提供しており、開発者がこの機能を実装するのを容易にしています。
もしサポートされているのであれば、リクエストボディサイズの制限をリバースプロキシ/ウェブサーバソフトウェアに組み込むこともできます。
以下に、`express` や `nginx` を用いてリクエストサイズを制限する例を示します。

### `express` のコード例

```javascript
const express = require('express');

const app = express();

app.use(express.json({ limit: '300kb' })); // body-parse のデフォルトは、100kb のボディサイズ制限です

// json ボディを用いたリクエスト
app.post('/json', (req, res) => {

    // body-parser は content-type をチェックしないため、リクエストペイロードの content-type が json かどうかチェックする
    if (!req.is('json')) {
        return res.sendStatus(415); // リクエストが JSON ボディを持っていなければ、Unsupported media type を返す
    }

    res.send('Hooray, it worked!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
```

🔗 [**express.json() に関する Express ドキュメント**](http://expressjs.com/en/4x/api.html#express.json)

### `nginx` の設定例

```nginx
http {
    ...
    # すべての受信リクエストのボディサイズを 1MB に制限する
    client_max_body_size 1m;
}

server {
    ...
    # この特定のサーバーに対する受信リクエストのボディサイズを 1MB に制限する
    client_max_body_size 1m;
}

location /upload {
    ...
    # このルートに対する受信リクエストのボディサイズを 1MB に制限する
    client_max_body_size 1m;
}
```

🔗 [**client_max_body_size に関する Express ドキュメント**](http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size)
