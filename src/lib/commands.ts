import * as vscode from 'vscode';
import { Setup, Base } from './setuper';


export class CommandPalette extends Base implements Setup {
    constructor(ctx: vscode.ExtensionContext) { super(ctx); }

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

    public setup() {
        this.register('readSelectedText', this.readSelectedText);
        this.register('helloWorld', this.helloWorld);
    }
}