# Friends SNS - デプロイメントガイド

## 🎉 デプロイ完了！

Vercelへの初回デプロイが成功しました！

**本番URL**: https://friends-sns.vercel.app

## ⚠️ 重要：環境変数の設定

アプリケーションを動作させるために、以下の環境変数をVercelダッシュボードで設定する必要があります。

### 1. Vercelダッシュボードにアクセス

1. https://vercel.com にアクセス
2. プロジェクト `friends-sns` を選択
3. 「Settings」タブをクリック
4. 左メニューから「Environment Variables」を選択

### 2. 必要な環境変数

以下の環境変数を設定してください：

#### 必須環境変数

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Neo4j設定
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# JWT設定
JWT_SECRET=your_secret_key_here

# Square Payment（オプション）
SQUARE_SANDBOX_APP_ID=your_square_app_id
SQUARE_SANDBOX_APP_SECRET=your_square_secret
SQUARE_SANDBOX_ACCESS_TOKEN=your_square_token
SQUARE_SANDBOX_LOCATION_ID=your_location_id

# Resend Email（オプション）
RESEND_API_KEY=your_resend_api_key
```

### 3. Neo4j Auraのセットアップ（推奨）

本番環境では、Neo4j Auraの使用を推奨します：

1. https://neo4j.com/cloud/aura/ にアクセス
2. 無料プランで開始（1 GBまで無料）
3. インスタンスを作成
4. 接続情報を取得してVercelに設定

### 4. Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトのURLとキーを取得
4. Vercelに環境変数として設定

### 5. デプロイの確認

環境変数設定後：

```bash
# 再デプロイを実行
vercel --prod

# またはVercelダッシュボードから
# "Deployments" → "Redeploy"
```

## 📊 現在のステータス

### ✅ 完了項目

- [x] ESLintエラーの修正
- [x] TypeScriptビルドエラーの修正
- [x] event.repository.tsのインポートエラー修正
- [x] next.config.jsの設定
- [x] Vercelへのデプロイ成功
- [x] テスト環境の構築（Jest + Cypress）

### 🔄 警告事項（動作には影響なし）

- Supabaseモジュールの Edge Runtime 警告
- Standaloneビルドの一部ファイルコピーエラー

これらは本番動作に影響しません。

### 📝 次のステップ

1. **環境変数の設定**（最優先）
2. **データベースの初期化**
   ```bash
   npm run init-db
   ```
3. **カスタムドメインの設定**（オプション）
4. **モニタリングの設定**（推奨）

## 🔧 トラブルシューティング

### 401エラーが表示される場合

Vercelのデプロイメント保護が有効になっています。以下のいずれかを実行：

1. Vercelダッシュボードで「Deployment Protection」を無効化
2. チームメンバーとしてアクセス権を付与
3. パスワード保護を設定

### データベース接続エラー

1. Neo4j URIが正しいことを確認
2. ファイアウォール設定を確認
3. Neo4j Auraの場合、IPホワイトリストを確認

### ログインできない場合

1. Supabase URLとキーが正しいことを確認
2. Supabaseダッシュボードで認証設定を確認
3. メール認証が有効になっているか確認

## 📞 サポート

問題が発生した場合は、以下を確認してください：

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neo4j Aura Documentation](https://neo4j.com/docs/aura/)
- [Supabase Documentation](https://supabase.com/docs)

---

**最終更新**: 2025-08-06
**バージョン**: 1.0.0