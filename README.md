# Markdown Preview Extension

VS Code extension for interactive Markdown preview with checkbox support.

## Features

- **Markdown Preview**: Open Markdown files in a separate preview tab
- **Interactive Checkboxes**: Click checkboxes in the preview to toggle them
- **Auto-sync**: Changes in checkboxes automatically update the source file
- **Real-time Updates**: Preview updates automatically when source file changes
- **Lifecycle Management**: Preview tabs close when source files are closed

## Usage

1. Open a Markdown file (.md or .markdown)
2. Click the preview button in the editor toolbar
3. The preview opens in a new tab
4. Click checkboxes in the preview to toggle them
5. Changes are automatically saved to the source file

## Installation

1. Package the extension: `vsce package`
2. Install the generated .vsix file in VS Code

## Development

```bash
npm install
npm run compile
```

## Requirements

- VS Code 1.74.0 or higher

## License

MIT