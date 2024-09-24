import * as vscode from 'vscode';
import { Base } from './setuper';
import re from '../utils/regex';



type Connection = {
    name: string;
    host: string;
    port: string;
    database?: string;
    username: string;
    password: string;
    ssl?: boolean;
}

export class DatabaseManager extends Base {
    private current: string = "";
    private connections: Connection[] = [
        {
            host: "localhost",
            port: "5432",
            database: "postgres",
            username: "postgres",
            password: "your-password",
            ssl: false,
            name: "postgres",
        },
    ];

    constructor(ctx: vscode.ExtensionContext,) {
        super(ctx);
        // Fetch the current connection from the settings
        const config = vscode.workspace.getConfiguration('psql-runner');
        const conn = config.get('currentConnection') as string;
    }


    private async promptForName(): Promise<string | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Connection Name',
            placeHolder: 'postgres',
        });

        return input;
    }

    private async promptForHost(): Promise<string | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Database host',
            placeHolder: 'localhost or an IPv4 address',
            validateInput: (value) => {
                if (!re.Or(re.IPV4, /^[\w.]+$/).test(value)) {
                    return 'Input must be an IPv4 address or a hostname';
                }
                return null; // Return null if the input is valid
            },
            value: 'localhost',
        });

        return input;
    }

    private async promptForPort(): Promise<string | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Database port',
            placeHolder: '5432',
            validateInput: (value) => {
                if (!/^[\d]+$/.test(value)) {
                    return 'Input must be numbers only';
                }
                return null; // Return null if the input is valid
            },
            value: '5432',
        });

        return input;
    }

    private async promptForDatabase(): Promise<string | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Database',
            placeHolder: 'postgres',
        });

        return input;
    }

    private async promptForUser(): Promise<string | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Database user',
            placeHolder: 'postgres',
            validateInput: (value) => {
                if (!/^[\w]+$/.test(value)) {
                    return 'Input must alphanumeric only';
                }
                return null; // Return null if the input is valid
            },
            value: 'postgres',
        });

        return input;
    }


    private async promptForPassword(): Promise<string | undefined> {
        const input = await vscode.window.showInputBox({
            prompt: 'Database password',
            placeHolder: 'postgres',
            password: true,
            value: 'postgres',
        });

        return input;
    }

    private async promptForSsl(): Promise<boolean> {
        const input = await vscode.window.showQuickPick(["Enable", "Disable"], {
            placeHolder: 'SSL',
            canPickMany: false,
            ignoreFocusOut: true,
            matchOnDescription: true,
        });

        return input && input === 'Enable' ? true : false;
    }


    public async createConnection() {

        let name = await this.promptForName();

        const host = await this.promptForHost();
        if (!host) {
            return;
        }

        const port = await this.promptForPort();
        if (!port) {
            return;
        }

        const database = await this.promptForDatabase();


        const username = await this.promptForUser();
        if (!username) {
            return;
        }

        const password = await this.promptForPassword();
        if (!password) {
            return;
        }

        const ssl = await this.promptForSsl();

        if (!name) {
            name = `New Connection (${host}:${port})`;
        }

        const conn = {
            host,
            port,
            username,
            password,
            ssl,
            name,
            database,
        } as Connection;

        vscode.window.showInformationMessage(JSON.stringify(conn));
    }


    public async connect(name: string) {
        vscode.window.showInformationMessage(`You selected: ${name}`);

        const c = this.connections.find(v => v.name === name);
        if (!c) {
            vscode.window.showInformationMessage(`No such connection: ${name}`);
            return;
        }

        // TODO close the connection

        this.current = c.name;
    }


    public get name() { return this.current.toString(); }
    public get available() { return this.connections.map(connection => connection.name); }
}