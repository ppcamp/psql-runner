import * as vscode from 'vscode';
import { Setup, Base } from './setuper';
import { DatabaseManager } from './database-manager';


export class CommandPalette extends Base implements Setup {
    private dbmanager: DatabaseManager;

    constructor(ctx: vscode.ExtensionContext, db: DatabaseManager) { super(ctx); this.dbmanager = db; }

    private readSelectedText() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            vscode.window.showInformationMessage(`Selected text: ${selectedText}`);
        } else {
            vscode.window.showInformationMessage('No active editor found.');
        }
    }

    private async helloWorld() {
        const input = await vscode.window.showInputBox({
            placeHolder: 'Enter your input here',
            prompt: 'Please enter some text',
            validateInput: (value) => {
                // Optional: Validate the input
                if (value.length < 3) {
                    return 'Input must be at least 3 characters long.';
                }
                return null; // Return null if the input is valid
            }
        });

        if (input) {
            vscode.window.showInformationMessage(`You entered: ${input}`);
        } else {
            vscode.window.showInformationMessage('Input was cancelled or empty.');
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

    public setup() {
        this.register('readSelectedText', this.readSelectedText);
        this.register('helloWorld', this.helloWorld);
        this.register('pickAndRemoveConnections', this.pickAndRemoveConnections);
    }
}