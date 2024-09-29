import * as vscode from 'vscode';
import path from 'path';

type HTMLSlot = string;

export class BaseResultPanel {
    protected _panel: vscode.WebviewPanel | null = null;
    protected uri: vscode.Uri;
    protected assets = 'assets' as const;
    protected ctx: vscode.ExtensionContext;
    protected disposables: vscode.Disposable[] = [];
    private title: string;
    private type: string;

    constructor(ctx: vscode.ExtensionContext, title: string, viewType: string) {
        this.type = viewType;
        this.title = title;
        this.uri = ctx.extensionUri;
        this.ctx = ctx;
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

    private urlUri(file: string) {
        return this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.uri, this.assets, file));
    }

    protected get mainScript() { return this.urlUri('main.js'); }
    protected get customCSS() { return this.urlUri('custom.css'); }
    protected get mainCSS() { return this.urlUri('vscode.css'); }

    protected render(slot: string, onLoadScript?: string): HTMLSlot {
        const panel = this.panel;
        const mainScript = this.mainScript;
        const customCSS = this.customCSS;
        const mainCSS = this.mainCSS;
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
                <script nonce="${nonce}">
                    console.log("here");
                    ${onLoadScript ? `window.addEventListener('load', function() {${onLoadScript}});` : ''}
                </script>
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

/**
 * @returns Gets a single unique identifier for the script that can be runned
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}