import * as vscode from 'vscode';
import { Plugin, Base } from './base/setuper';
import { DatabaseManager } from './database-manager';
import Logger from './base/logging';
import { statmentFromDocument } from '../utils/string';


export class CommandPalette extends Base implements Plugin {
    private dbmanager: DatabaseManager;

    constructor(ctx: vscode.ExtensionContext, log: Logger, db: DatabaseManager) { super(ctx, log); this.dbmanager = db; }

    /**
     * @todo add support to dynamic query parameters and caching
     */
    private async runQuery() {

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            let text = editor.document.getText(selection);

            if (!text) {
                const start = editor.selection.active.line;
                const maxEnd = editor.document.lineCount;

                text = statmentFromDocument(editor.document, start, maxEnd);
            }

            await this.dbmanager.runQuery(text);
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
        this.register('readSelectedText', this.runQuery);
        this.register('pickAndRemoveConnections', this.pickAndRemoveConnections);
    }
}