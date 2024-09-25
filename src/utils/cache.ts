import * as vscode from 'vscode';

export class GlobalCache {
    private state: vscode.Memento;

    constructor(ctx: vscode.ExtensionContext) { this.state = ctx.globalState; }

    public async update(key: string, value: any): Promise<void> {
        await this.state.update(key, value);
    }

    public async get(key: string): Promise<any> {
        return this.state.get(key);
    }
}
