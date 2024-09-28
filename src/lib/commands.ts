import * as vscode from 'vscode';
import { Plugin, Base } from './base/setuper';
import { DatabaseManager } from './database-manager';
import Logger from './base/logging';


export class CommandPalette extends Base implements Plugin {
    private dbmanager: DatabaseManager;

    constructor(ctx: vscode.ExtensionContext, log: Logger, db: DatabaseManager) { super(ctx, log); this.dbmanager = db; }

    /**
     * @todo add support to dynamic query parameters and caching
     */
    private async runSelectedQuery() {

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);

            const result = await this.dbmanager.query(text);
            if (!result) {
                return; // no active database
            }
            if (result.rows.length === 0) {
                vscode.window.showInformationMessage('No data found');
                return;
            }

            const headers = result.fields.map(field => field.name);
            const body = result.rows.map(v => headers.map(h => v[h]).join('|'));
            let content = '<h1>Output</h1><div>'
                + headers.join('|') + '\n'
                + headers.map(() => '---').join('|') + '\n'
                + body.join('\n') + '</div>';
            const document = await vscode.workspace.openTextDocument({ content });
            vscode.window.showTextDocument(document,);
            // vscode.window.showInformationMessage(`Selected text`, { modal: true, detail: selectedText });
        } else {
            vscode.window.showErrorMessage('No active editor found.');
        }
    }


    private async pickAndRemoveConnections() {
        const input = await vscode.window.showQuickPick(this.dbmanager.available, {
            placeHolder: 'Select Conncection to remove',
            canPickMany: true,
            ignoreFocusOut: true,
            matchOnDescription: true,
        });

        if (!input) {
            return input;
        }

        // Show confirmation dialog
        const detail = input.map(v => `- ${v}`).join('\n');
        const confirm = await vscode.window.showWarningMessage(
            `Are you sure you want to remove the following connections?`,
            { modal: true, detail }, // Make the dialog modal
            'Yes',
            'No'
        );

        const el = confirm === 'Yes' ? input : undefined; // Cancel the operation


        if (!el) {
            return;
        }

        // needs to be sync because we don't use any synchronization in the manager
        for (const connection of el) {
            await this.dbmanager.remove(connection);
        }
    }

    public init() {
        this.register('readSelectedText', this.runSelectedQuery);
        this.register('pickAndRemoveConnections', this.pickAndRemoveConnections);
    }
}