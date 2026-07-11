# 今日の暦 — 日めくりカレンダー

旧暦・六曜・二十四節気・今日は何の日・生まれてから何日目、を1枚の「日めくりカレンダー」
としてまとめた静的Webサイトです。ビルド不要・フレームワーク不要（Vanilla HTML/CSS/JS）
なので、そのまま GitHub Pages で公開できます。

## ファイル構成

```
koyomi/
├── index.html          … ページ本体・メタタグ・構造化データ
├── css/style.css        … 「紙・綴じ穴・ミシン目」を模した日めくりデザイン
├── js/
│   ├── astro.js          … 太陽黄経・新月時刻の天文計算（低精度近似式）
│   ├── lunar.js           … 旧暦（太陰太陽暦）・二十四節気・六曜の算出
│   ├── i18n.js             … 日本語/英語の文言辞書
│   ├── illustrations.js    … 季節の切り絵風イラスト（月ごと・記念日ごと）
│   ├── historyEvents.js     … Wikipedia「今日は何の日」APIの取得
│   └── app.js               … 画面描画・ナビゲーション・状態管理
├── robots.txt
└── sitemap.xml
```

## ローカルで確認する

ブラウザの `fetch` を使うため `file://` では一部機能（今日は何の日）が動きません。
下記のように簡易サーバーを立てて確認してください。

```bash
cd koyomi
python3 -m http.server 8000
# http://localhost:8000 を開く
```

## GitHub Pages への公開

1. このフォルダの中身をリポジトリのルート（またはお好きなブランチ）に置く
2. リポジトリの Settings → Pages で公開ブランチ/フォルダを指定
3. `index.html` 内の `https://example.com/` (canonical, og:url, sitemap.xml) を
   実際に公開するURLに書き換える

**AdSense の ads.txt を使う場合の注意**：GitHub Pages のプロジェクトページ
（`username.github.io/リポジトリ名/` の形式）は URL のパスが1階層深くなるため、
`ads.txt` をドメイン直下に置けず認証に失敗することがあります。independent な
カスタムドメインを設定するか、ユーザー/組織ルートページ（`username.github.io`
そのもの）にこのサイトを置くと解決しやすいです。

## 機能の仕組みと注意点

- **旧暦・二十四節気**：Jean Meeus の低精度天文公式（太陽黄経・新月時刻）を
  JavaScript で実装し、算出しています。国立天文台の公式暦とは天文暦モデルの
  精度差により、まれに1日程度ずれる可能性があります（特に閏月が入る年の
  月境界付近）。実運用で完全一致が必要な場合は、国立天文台の「暦要項」データ
  を別途組み込むことをおすすめします。
- **六曜**：旧暦の月・日から算出する伝統的な計算式を使用しています。
- **今日は何の日**：Wikipedia の公開 REST API
  (`https://{ja|en}.wikipedia.org/api/rest_v1/feed/onthisday/all/{mm}/{dd}`)
  を認証なし・クライアントサイドで呼び出しています。APIが混雑時に応答しない
  場合はエラーメッセージを表示します。アクセスが多くなる場合は、Cloudflare
  Workers などで簡易キャッシュ層を挟むと安定します。
- **生まれてから何日目**：入力した誕生日はこの端末のブラウザ（localStorage）
  にのみ保存され、外部には送信されません。
- **イラスト**：366日分の個別イラストの代わりに、月ごとの季節イラスト＋
  正月・節分・ひな祭り・こどもの日・七夕・ハロウィン・クリスマスなど
  特定の記念日用イラストを用意しています。`js/illustrations.js` の `SCENES` /
  `SPECIAL` に追記すれば、イラストを自由に増やせます。

## SEO 対応

- タイトル・meta description・Open Graph タグを日付ごとに動的更新
- `WebSite` / `WebPage` の構造化データ（JSON-LD）を出力
- URLハッシュ（例: `#/2026-07-11/ja`）で日付・言語を状態化 → その日をブックマーク/共有可能
- `robots.txt` / `sitemap.xml` を同梱

※ このサイトはクライアントサイドJSで内容を描画するSPA構成のため、検索エンジンが
JavaScriptを実行しない場合はコンテンツが読み取られない可能性があります。より
確実なSEOを狙う場合は、日付ごとに静的HTMLを事前生成する仕組み（プリレンダリング）
の追加を検討してください。

## カスタマイズのヒント

- 配色・季節ごとのアクセントカラーは `css/style.css` の `:root` 変数と
  `.season-*` クラスで管理しています。
- フォントは Google Fonts の Shippori Mincho / Zen Kaku Gothic New を使用。
  差し替える場合は `index.html` の `<link>` と CSS の `--font-*` 変数を変更してください。
