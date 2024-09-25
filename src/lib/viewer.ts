import * as vscode from 'vscode';

/**
 * @example
 * // don't forget to add the command in the package.json file
 * let disposable = vscode.commands.registerCommand('extension.showCustomPage', () => {
 *     const panel = vscode.window.createWebviewPanel(
 *         'customPage', // Identifies the type of the webview. Used internally
 *         'Custom Page', // Title of the panel displayed to the user
 *         vscode.ViewColumn.One, // Editor column to show the new webview panel in
 *         {} // Webview options
 *     );
 *
 *     // Set the HTML content for the webview
 *     panel.webview.html = getWebviewContent();
 * });
 */
export class ArgInputView {

    public register(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('extension.showCustomPage', () => {
            const panel = vscode.window.createWebviewPanel(
                'customPage', // Identifies the type of the webview. Used internally
                'Custom Page', // Title of the panel displayed to the user
                vscode.ViewColumn.One, // Editor column to show the new webview panel in
                {} // Webview options
            );

            // Set the HTML content for the webview
            panel.webview.html = this.getWebviewContent();
        }, this);

        context.subscriptions.push(disposable);
    }


    public getWebviewContent() {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Custom Page</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    h1 {
                        color: #007acc;
                    }
                </style>
            </head>
            <body>
                <h1>Hello, this is a custom page!</h1>
                <p>You can add any HTML content here.</p>
            </body>
            </html>`;
    }
}


