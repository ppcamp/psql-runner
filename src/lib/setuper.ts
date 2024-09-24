import * as vscode from 'vscode';


export interface Setup { setup: () => void; }


export class Base {
    protected ctx: vscode.ExtensionContext;

    constructor(ctx: vscode.ExtensionContext) { this.ctx = ctx; }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    protected register(cmd: string, cb: () => void): string {
        if (!cmd.includes("psql-runner")) {
            cmd = `psql-runner.${cmd}`;
        }
        const disposable = vscode.commands.registerCommand(cmd, cb, this);
        this.ctx.subscriptions.push(disposable);
        return cmd;
    }
}