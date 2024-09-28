// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CommandPalette } from './lib/command-palette';
import { StatusBar } from './lib/status-bar';
import { DatabaseManager } from './lib/database-manager';
import { ActivityBarView } from './lib/activity-bar';
import Logger from './lib/base/logging';

class Extension {
    private manager?: DatabaseManager;
    private bar?: StatusBar;
    private command?: CommandPalette;
    private activity?: ActivityBarView;
    private logger!: Logger;

    public init(ctx: vscode.ExtensionContext) {
        this.logger = new Logger(ctx);

        this.logger.info('Initializing extension');

        this.manager = new DatabaseManager(ctx);
        this.bar = new StatusBar(ctx, this.manager);
        this.command = new CommandPalette(ctx, this.manager);
        this.activity = new ActivityBarView(ctx);

        [this.bar, this.command, this.activity].forEach(s => s.init());

        console.info('Activated psql-runner');
    }


    public destroy() {
        this.logger.info('Deactivating extension');
        [this.bar, this.command, this.activity, this.logger].forEach(s => s?.deinit());
        console.info('Deactivated psql-runner');
    }
}





const extension = new Extension();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// This line of code will only be executed once when your extension is activated
export function activate(context: vscode.ExtensionContext) { extension.init(context); }
// This method is called when your extension is deactivated
export function deactivate() { extension.destroy(); }