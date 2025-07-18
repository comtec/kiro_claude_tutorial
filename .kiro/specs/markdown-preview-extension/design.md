# 設計書

## 概要

このVS Code拡張機能は、Markdownファイルのインタラクティブプレビュー機能を提供します。主要な機能として、別タブでのMarkdownプレビュー表示と、プレビュー内でのチェックボックス操作によるソースファイルの自動更新があります。

## アーキテクチャ

### シンプル構成（個人利用向け）

```
VS Code Extension
├── Extension Main (extension.ts)
│   ├── プレビューコマンド登録
│   ├── Webview作成・管理
│   └── チェックボックス更新処理
└── Webview (HTML/CSS/JS)
    ├── Markdownレンダリング（VS Code内蔵）
    └── チェックボックスクリック処理
```

### 技術スタック

- **開発言語**: TypeScript（最小限）
- **フレームワーク**: VS Code Extension API
- **Markdownレンダリング**: VS Code内蔵のmarkdown-it
- **UI**: VS Code Webview API
- **パッケージマネージャー**: npm

## コンポーネントと インターフェース

### 1. Extension Main (extension.ts) - 統合アプローチ

シンプルな実装のため、すべての機能を1つのファイルに統合：

- 拡張機能のアクティベーション
- プレビューコマンドの登録
- Webviewの作成と管理
- チェックボックス更新処理
- ファイル変更監視（VS Code内蔵のonDidChangeTextDocument使用）

**主要機能:**
```typescript
// 基本的な関数ベースのアプローチ
function activate(context: vscode.ExtensionContext): void
function createPreview(document: vscode.TextDocument): void
function updateCheckbox(line: number, checked: boolean): void
```

## データモデル

### 最小限のデータ構造

```typescript
// グローバル変数で管理（シンプルなアプローチ）
let currentPanel: vscode.WebviewPanel | undefined;
let currentDocument: vscode.TextDocument | undefined;

// Webview通信用の簡単なメッセージ
interface Message {
  command: 'toggleCheckbox';
  line: number;
  checked: boolean;
}
```

## エラーハンドリング

### エラーカテゴリ

1. **ファイル操作エラー**
   - ファイル読み込み失敗
   - ファイル書き込み失敗
   - ファイル削除検知

2. **レンダリングエラー**
   - Markdown構文エラー
   - Webview作成失敗

3. **チェックボックス操作エラー**
   - 位置特定失敗
   - 状態更新失敗

### エラー処理戦略

- **グレースフルデグラデーション**: エラーが発生してもプレビュー機能は継続
- **ユーザー通知**: 重要なエラーはステータスバーまたは通知で表示
- **ログ記録**: デバッグ用のログ出力
- **自動復旧**: 可能な場合は自動的にエラー状態から復旧

## 実装アプローチ

### 開発・テスト戦略（個人利用向け）

- **手動テスト**: 実際のMarkdownファイルでの動作確認
- **段階的実装**: 基本プレビュー → チェックボックス機能の順で実装
- **最小限のエラーハンドリング**: console.logとtry-catchで基本的なエラー対応

### 実装の優先順位

1. **基本プレビュー機能**: Markdownファイルを別タブで表示
2. **チェックボックス検出**: プレビュー内のチェックボックスを特定
3. **双方向更新**: クリックでソースファイル更新
4. **エラーハンドリング**: 基本的な例外処理

### 簡素化された考慮事項

- **セキュリティ**: VS Code内蔵のWebviewセキュリティに依存
- **パフォーマンス**: 小さなファイル向けなので最適化は最小限
- **テスト**: 手動テストと基本的な動作確認のみ