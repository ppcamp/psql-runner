import * as vscode from 'vscode';
import { Setup, Base } from './setuper';
import { DatabaseManager } from './database-manager';


export class StatusBar extends Base implements Setup {
    private item: vscode.StatusBarItem | undefined;
    private dbmanager: DatabaseManager;

    constructor(ctx: vscode.ExtensionContext, db: DatabaseManager) { super(ctx); this.dbmanager = db; }

    private updateBarStatus(msg: string) {
        if (!this.item) { return; }
        this.item.text = `$(database) ${msg}`;
    }


    private async showItems() {
        const createstr = 'Create a new connection';

        const items = this.dbmanager.available.concat(createstr);

        const selectedItem = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select your connection',
            canPickMany: false,
        });

        if (!selectedItem) {
            vscode.window.showInformationMessage('No item selected.');
            return;
        }

        if (selectedItem === createstr) {
            this.dbmanager.createConnection();

        } else {
            await this.dbmanager.connect(selectedItem);

            this.updateBarStatus(selectedItem);
        }
    }


    public setup() {
        // Create a status bar item
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

        // Set the text and tooltip for the status bar item
        this.item.tooltip = 'Click to connect/switch databases';

        // Show the status bar item
        this.item.show();

        this.updateBarStatus('Not connected');

        // Register a command to be executed when the status bar item is clicked
        this.item.command = 'psql-runner.statusBarItemClicked';
        this.ctx.subscriptions.push(this.item);

        this.register(this.item.command, this.showItems);
    }

}