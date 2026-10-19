# 暮金記帳 Mujin Ledger V2.0

手機 H5 單頁記帳：快速輸入「午餐 800」、收支紀錄、分類分析、JSON/CSV 匯出，以及 Firebase 電子郵件登入與 Firestore 即時同步。

## 網站部署
GitHub Pages → Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save。
預計網址：https://tristaru816-wq.github.io/mujin-ledger/

## 雲端啟用清單
- Firebase 專案：mujin-ledger，網頁 App config 已在 `index.html`。
- Authentication → Email/Password 已啟用。
- Firestore Database 已建立，並已透過 Console 發布 `firestore.rules`（此檔案僅供核對，GitHub 本身不會部署資料庫規則）。
- Authentication → Settings → Authorized domains：確保 `tristaru816-wq.github.io` 已加入，才能在正式網址登入。
- 正式測試需在網頁登入帳號後，新增一筆交易並確認 Firestore `users/{uid}/records/{recordId}` 出現，再使用另一裝置同帳號登入檢查同步。

## 安全提醒
GitHub Pages 公開的只有網站程式；不要在儲存庫放入帳號密碼、私鑰或真實交易明細。Firebase 透過 Authentication 與 Firestore Rules 限制每位登入者只能讀取自己的紀錄。當頁面顯示本機模式時，尚未登入雲端；重要紀錄請定期備份。

