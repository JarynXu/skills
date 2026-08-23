> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/hideerrors.japanese.md`  
> Upstream Git blob: `cfebf0b5141f794ff62138e30dbf7673d8eb0093`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# エラーの詳細をクライアントから隠す

### 一段落説明

サーバファイルのパス、使用中のサードパーティモジュール、その他攻撃者に悪用される可能性のあるアプリケーションの内部ワークフローなど、機密性の高いアプリケーションの詳細情報が漏洩するリスクがあるため、本番環境においてクライアントにアプリケーションエラーの詳細を晒すべきではありません。
Express には、アプリ内で発生する恐れのあるエラーを処理するエラーハンドラが組み込まれています。このデフォルトのエラー処理ミドルウェア関数は、ミドルウェア関数スタックの最後に追加されます。
エラーを `next()` に渡し、カスタムエラーハンドラで処理しない場合は、組み込みの Express エラーハンドラで処理されます。エラーはスタックトレースと共にクライアントに書き込まれます。この動作は `NODE_ENV` が `development` に設定されている場合に有効ですが、`NODE_ENV` が `production` に設定されている場合は、スタックトレースは書き込まれず、HTTP レスポンスコードのみが書き込まれます。

### コード例: Express エラーハンドラ

```javascript
// 本番のエラーハンドラ
// スタックトレースがユーザーに漏洩しない
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
```

### その他のリソース

🔗 [Express.js エラーハンドリングドキュメント](https://expressjs.com/en/guide/error-handling.html)
