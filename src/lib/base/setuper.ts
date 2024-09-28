import * as vscode from 'vscode';
import Logger from './logging';

export interface DeInitializer { deinit: () => void; }
export interface Initializer { init: () => void; }
export interface Plugin extends Initializer, DeInitializer { }


export class Base implements Plugin {
    protected ctx: vscode.ExtensionContext;
    private disposables: vscode.Disposable[] = [];
    protected log: Logger;

    constructor(ctx: vscode.ExtensionContext, logger: Logger) { this.ctx = ctx; this.log = logger; }

    public init() { throw new Error("not implemented"); }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    protected register(cmd: string, cb: () => void): string {
        if (!cmd.includes("psql-runner")) {
            cmd = `psql-runner.${cmd}`;
        }
        const disposable = vscode.commands.registerCommand(cmd, cb, this);
        this.disposables.push(disposable);

        this.ctx.subscriptions.push(disposable);
        return cmd;
    }

    protected subscribe(cb: vscode.Disposable) {
        this.ctx.subscriptions.push(cb);
        this.disposables.push(cb);
    }

    public deinit() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}