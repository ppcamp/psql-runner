import * as vscode from 'vscode';
import { Base, Setup } from './setuper';
import { NodeDependenciesProvider } from '../providers/nodejs';

export class ActivityBarView extends Base implements Setup {

    public createView() {
        const panel = vscode.window.createWebviewPanel(
            'myRightBarView',
            'My Right Bar Menu',
            vscode.ViewColumn.Beside,
            {}
        );

        panel.webview.html = this.getWebviewContent();
    }

    private getWebviewContent() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>My Right Bar Menu</title>
        </head>
        <body>
            <h1>Hello from My Right Bar Menu!</h1>
        </body>
        </html>`;
    }

    public setup() {
        const rootPath =
            vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
                ? vscode.workspace.workspaceFolders[0].uri.fsPath
                : undefined;

        vscode.window.registerTreeDataProvider('myRightBarView', new NodeDependenciesProvider(rootPath ?? ''));
        this.register('myRightBarView', this.createView);
    }

}
