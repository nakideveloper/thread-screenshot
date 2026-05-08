# Thread Screenshot

SlackのAI-MOP（GPT-5.4 , GPT o4-mini , claude-4.6 Sonnet）を含むスレッドまたはチャンネル、ChatGPT(chatgpt.com)、Claude(claude.ai)、Gemini(gemini.google.com) のチャットスレッドを自動でスクロールして、クリップボードにコピーするChrome拡張機能です。
INIAD生向けに作成しましたが、INIAD生以外の方でもご利用いただけます。

## 対応プラットフォーム

- SlackのAI-MOP（GPT-5.4、GPT o4-mini、claude-4.6 Sonnet）を含むスレッドまたはチャンネル（※一応、SlackのチャンネルまたはスレッドでしたらAI-MOP以外でも使用可能です）。
- ChatGPT(chatgpt.com)
- Claude(claude.ai)
- Gemini(gemini.google.com)
> [!NOTE]
> いずれもブラウザ版のみ対応しています。Chromeの拡張機能のためデスクトップアプリは対応していません。
> また、Firefoxには対応しておりません。

## インストール方法

1. Chromeの拡張機能管理画面を開く（またはアドレスバーに`chrome://extensions` と入力する）
2. 右上の **デベロッパーモード** を有効にする
3. **パッケージ化されていない拡張機能を読み込む** をクリック
4. **Thread Screenshot** フォルダを選択する

## 使い方

対応プラットフォームでチャットスレッドを開き、拡張機能のアイコンをクリックするだけです。自動的に一番上までスクロールし、全体をキャプチャして、クリップボードにコピーします。
（Googleドキュメントの仕様上、一枚の画像としてコピーすると画質が劣化し読み取りができなくなってしまうため、複数の画像に分割してコピーします）

> [!IMPORTANT]
> サイトごとに初回利用時は、画面左上に**クリップボードへのコピーの許可**を求められるので、**「許可」を押してください。**
> （許可をしないと「画像を処理中」で止まってしまいます）

Googleドキュメントなど画像を貼り付けられるアプリケーションにそのままペースト（Ctrl+V）できます。

## キャプチャの中止方法

誤って起動してしまった場合は、以下のいずれかの方法で中止できます。

- 画面右下に表示されるトースト通知の **「中止 (Esc)」ボタン** をクリックする
- キーボードの **Escキー** を押す

中止後は「キャプチャを中止しました。」と表示され、スクロール位置も元に戻ります。

## トラブルシューティング

| 症状 | 対処法 |
|---|---|
| 「スレッドが見つかりません」と表示される | ページをリロードしてから再試行してください |
| 「画像を処理中」で止まる | クリップボードへのアクセスを許可しているか確認してください（初回利用時） |
| キャプチャが途中で止まる | スクロール中にタブを切り替えないでください |
| Slackで動作しない | ブラウザ版のSlackを使用しているか確認してください（デスクトップアプリは非対応） |
| コピー失敗と表示される | ページ内をクリックしてからもう一度試してください |

## よくある質問

**Q. 長いスレッドだと時間がかかる？**
A. スクロール1ステップあたり約1秒かかります。スレッドが長いほど時間がかかりますが、処理中は右下にRUNNINGと表示されます。

**Q. Googleドキュメント以外にも貼り付けられる？**
A. Notion、Microsoft Word、メモ帳など、画像の貼り付けに対応しているアプリであれば基本的に使えます。

**Q. 画像が一部しかキャプチャされていない？**
A. 途中で中止した可能性があります。Escキーや中止ボタンを誤って押していないか確認してください。

**Q. Slack等のDOMが変更されて動かなくなった場合は？**
A. @naki_iniad までご連絡ください。セレクタを更新します。

## 注意事項

- **キャプチャ中はタブを切り替えないでください。** 別のタブに移動するとキャプチャに失敗します。
- スレッドが非常に長い場合、Googleドキュメントへの貼り付けに時間がかかることがあります。
- Slack等のUIアップデートにより、動作しなくなることがあります。

## プライバシー

このツールはすべての処理をブラウザ上でローカルに完結しています。**外部サーバーへのデータ送信は一切行いません。**

## 連絡先
不具合や要望、使い方が分からない等がありましたら、X（旧Twitter）のDMで@naki_iniad までご連絡ください。

---

# Thread Screenshot (English)

A Chrome extension that automatically scrolls through and captures chat threads on Slack (including AI-MOP threads and channels with GPT-5.4, GPT o4-mini, and claude-4.6 Sonnet), ChatGPT (chatgpt.com), Claude (claude.ai), and Gemini (gemini.google.com), then copies the result to your clipboard.
Originally created for INIAD students, but anyone is welcome to use it.

## Supported Platforms

- Slack threads and channels including AI-MOP (GPT-5.4, GPT o4-mini, claude-4.6 Sonnet) *(any Slack thread or channel works, not just AI-MOP)*
- ChatGPT(chatgpt.com)
- Claude(claude.ai)
- Gemini(gemini.google.com)

> [!NOTE]
> Browser version only. Desktop apps and Firefox are not supported.

## Installation

1. Open Chrome's extension management page (or type `chrome://extensions` in the address bar)
2. Enable **Developer mode** in the top-right corner
3. Click **Load unpacked**
4. Select this folder

## Usage

Open a chat thread on any supported platform and click the extension icon. The extension will automatically scroll to the top, capture the full thread, and copy it to your clipboard.
*(To avoid image quality degradation when pasting into Google Docs, the capture is split into multiple images rather than one.)*

> **Important:** The first time you use the extension on each site, a permission prompt will appear in the top-left of your screen asking to allow clipboard access. Click **Allow**. If you skip this, the extension will stall at "Processing image…".

You can paste directly (Ctrl+V) into Google Docs or any image-compatible application.

## How to Cancel a Capture

If you accidentally start a capture, you can stop it at any time:

- Click the **"中止 (Esc)" button** on the toast notification in the bottom-right corner
- Press the **Esc key** on your keyboard

After cancelling, the message "キャプチャを中止しました。" will appear and the scroll position will be restored.

## Troubleshooting

| Symptom | Solution |
|---|---|
| "Thread not found" error | Reload the page and try again |
| Stalls at "Processing image…" | Make sure you have allowed clipboard access (first-time prompt) |
| Capture stops mid-way | Do not switch tabs while capturing |
| Doesn't work on Slack | Make sure you're using the browser version of Slack (desktop app is not supported) |
| "Copy failed" message | Click anywhere on the page, then try again |

## FAQ

**Q. Does it take longer for longer threads?**
A. Yes. Each scroll step takes about 1 second, so longer threads take more time. The RUNNING indicator in the bottom-right will show progress.

**Q. Can I paste into apps other than Google Docs?**
A. Yes. Any app that supports image pasting (Notion, Microsoft Word, etc.) should work.

**Q. Only part of the thread was captured — why?**
A. You may have accidentally cancelled the capture. Check if you pressed Esc or the cancel button during the process.

**Q. What if it stops working after a Slack UI update?**
A. Please contact [@naki_iniad](https://x.com/naki_iniad) and the selectors will be updated.

## Notes

- **Do not switch tabs while capturing.** Switching tabs will cause the capture to fail.
- Pasting very long threads into Google Docs may take a moment.
- Slack or other UI updates may temporarily break compatibility.

## Privacy

All processing happens locally in your browser. **No data is ever sent to any external server.**

## Contact

For bug reports, feature requests, or questions, please DM [@naki_iniad](https://x.com/naki_iniad) on X (formerly Twitter).
