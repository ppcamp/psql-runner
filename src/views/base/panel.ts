import * as vscode from 'vscode';
import path, { relative } from 'path';

type HTMLSlot = string;

export class BaseResultPanel {
    protected _panel: vscode.WebviewPanel | null;
    protected uri: vscode.Uri;
    protected assets = 'resources' as const;
    protected ctx: vscode.ExtensionContext;
    protected disposables: vscode.Disposable[] = [];
    private title: string;
    private type: string;

    constructor(ctx: vscode.ExtensionContext, title: string, viewType: string) {
        this.type = viewType;
        this.title = title;
        this.uri = ctx.extensionUri;
        this.ctx = ctx;
        this._panel = this.panel;
    }

    protected get panel() {
        if (this._panel) {
            return this._panel;
        }

        const panel = vscode.window.createWebviewPanel(
            this.type,
            this.title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                enableForms: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.ctx.extensionPath, this.assets))],
            }
        );

        this.disposables.push(panel);

        panel.onDidDispose(() => { this._panel = null; }, this);

        // Update the content based on view changes
        // Update the content based on view changes
        // this._panel.onDidChangeViewState(
        // 	e => {
        // 		if (this._panel.visible) {
        // 			this._update();
        // 		}
        // 	},
        // 	null,
        // 	this._disposables
        // );
        panel.webview.onDidReceiveMessage(this.onMessage, this, this.disposables);

        this._panel = panel;
        return panel;
    }

    protected onMessage(_: Message) { throw new Error('Not implemented'); }

    public deinit() {
        this.disposables.forEach(v => v.dispose());
        this._panel = null;
    }

    protected render(slot: string): HTMLSlot {
        const panel = this.panel;
        const mainScript = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.uri, this.assets, 'main.js'));
        const customCSS = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.uri, this.assets, 'custom.css'));
        const mainCSS = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.uri, this.assets, 'vscode.css'));
        const cspSrc = panel.webview.cspSource;
        const nonce = this.nonce;

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                -->

                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSrc}; img-src ${cspSrc} https:; script-src 'nonce-${nonce}';">
                <link href="${customCSS}" rel="stylesheet">
                <link href="${mainCSS}" rel="stylesheet">
            </head>
            <body>
                ${slot}
                <script nonce="${nonce}" src="${mainScript}"></script>
            </body>`.trim() as HTMLSlot;
    }

    protected show(html: string) {
        const panel = this.panel;
        panel.webview.html = html;
        const viewColumn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : vscode.ViewColumn.One;
        panel.reveal(viewColumn, true);
    }

    protected get nonce() { return getNonce(); }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}