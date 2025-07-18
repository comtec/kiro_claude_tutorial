"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
let currentPanel;
let currentDocument;
function activate(context) {
    const disposable = vscode.commands.registerCommand('markdown-preview-extension.openPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const document = editor.document;
        if (document.languageId !== 'markdown') {
            vscode.window.showErrorMessage('Current file is not a Markdown file');
            return;
        }
        createPreview(document);
    });
    context.subscriptions.push(disposable);
    const textDocumentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
        if (currentPanel && currentDocument && event.document === currentDocument) {
            updatePreview();
        }
    });
    context.subscriptions.push(textDocumentChangeListener);
    const textDocumentCloseListener = vscode.workspace.onDidCloseTextDocument(document => {
        if (currentDocument && document === currentDocument) {
            if (currentPanel) {
                currentPanel.dispose();
                currentPanel = undefined;
                currentDocument = undefined;
            }
        }
    });
    context.subscriptions.push(textDocumentCloseListener);
}
exports.activate = activate;
function createPreview(document) {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
    if (currentPanel) {
        currentPanel.reveal(columnToShowIn);
        currentDocument = document;
        updatePreview();
    }
    else {
        currentPanel = vscode.window.createWebviewPanel('markdownPreview', 'Markdown Preview', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(document.uri.fsPath)]
        });
        currentPanel.onDidDispose(() => {
            currentPanel = undefined;
            currentDocument = undefined;
        });
        currentPanel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'toggleCheckbox':
                    updateCheckbox(message.line, message.checked);
                    break;
            }
        });
        currentDocument = document;
        updatePreview();
    }
}
function updatePreview() {
    if (!currentPanel || !currentDocument) {
        return;
    }
    const content = currentDocument.getText();
    const html = renderMarkdownWithCheckboxes(content);
    currentPanel.webview.html = getWebviewContent(html);
}
function renderMarkdownWithCheckboxes(markdown) {
    const lines = markdown.split('\n');
    const processedLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const uncheckedMatch = line.match(/^(\s*)-\s\[\s\]\s(.*)$/);
        const checkedMatch = line.match(/^(\s*)-\s\[x\]\s(.*)$/);
        if (uncheckedMatch) {
            const indent = uncheckedMatch[1];
            const text = uncheckedMatch[2];
            processedLines.push(`${indent}- <input type="checkbox" data-line="${i}" onclick="toggleCheckbox(${i}, this.checked)"> ${text}`);
        }
        else if (checkedMatch) {
            const indent = checkedMatch[1];
            const text = checkedMatch[2];
            processedLines.push(`${indent}- <input type="checkbox" data-line="${i}" checked onclick="toggleCheckbox(${i}, this.checked)"> ${text}`);
        }
        else {
            // Basic markdown rendering for other elements
            let processedLine = line;
            // Headers
            processedLine = processedLine.replace(/^### (.*)$/, '<h3>$1</h3>');
            processedLine = processedLine.replace(/^## (.*)$/, '<h2>$1</h2>');
            processedLine = processedLine.replace(/^# (.*)$/, '<h1>$1</h1>');
            // Bold and italic
            processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            processedLine = processedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
            // Code blocks
            if (line.startsWith('```')) {
                if (line === '```') {
                    processedLine = '</pre>';
                }
                else {
                    processedLine = '<pre>';
                }
            }
            // Blockquotes
            processedLine = processedLine.replace(/^> (.*)$/, '<blockquote>$1</blockquote>');
            // Regular list items
            processedLine = processedLine.replace(/^(\s*)- (.*)$/, '$1<li>$2</li>');
            processedLines.push(processedLine);
        }
    }
    return processedLines.join('<br>\n');
}
function getWebviewContent(html) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        
        h1 {
            font-size: 2em;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 0.3em;
        }
        
        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 0.3em;
        }
        
        pre {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
        }
        
        code {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
        
        blockquote {
            border-left: 4px solid var(--vscode-panel-border);
            margin: 0;
            padding-left: 16px;
            color: var(--vscode-descriptionForeground);
        }
        
        ul, ol {
            padding-left: 2em;
        }
        
        li {
            margin-bottom: 0.25em;
        }
        
        input[type="checkbox"] {
            margin-right: 8px;
        }
        
        a {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        
        th, td {
            border: 1px solid var(--vscode-panel-border);
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background-color: var(--vscode-textBlockQuote-background);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div id="content">${html}</div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function toggleCheckbox(line, checked) {
            vscode.postMessage({
                command: 'toggleCheckbox',
                line: line,
                checked: checked
            });
        }
    </script>
</body>
</html>`;
}
async function updateCheckbox(line, checked) {
    if (!currentDocument) {
        console.log('No current document');
        return;
    }
    // Get the editor for the current document
    const editors = vscode.window.visibleTextEditors;
    const editor = editors.find(e => e.document.uri.toString() === currentDocument.uri.toString());
    if (!editor) {
        console.log('No editor found for current document');
        return;
    }
    try {
        const lineText = currentDocument.lineAt(line).text;
        let newText;
        if (checked) {
            newText = lineText.replace(/^(\s*-\s)\[\s\](\s.*)$/, '$1[x]$2');
        }
        else {
            newText = lineText.replace(/^(\s*-\s)\[x\](\s.*)$/, '$1[ ]$2');
        }
        if (newText !== lineText) {
            const range = new vscode.Range(line, 0, line, lineText.length);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(currentDocument.uri, range, newText);
            const success = await vscode.workspace.applyEdit(edit);
            if (success) {
                await currentDocument.save();
                console.log(`Checkbox updated on line ${line}: ${checked}`);
            }
            else {
                console.error('Failed to apply edit');
                vscode.window.showErrorMessage('Failed to update checkbox');
            }
        }
    }
    catch (error) {
        console.error('Error updating checkbox:', error);
        vscode.window.showErrorMessage(`Failed to update checkbox: ${error}`);
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map