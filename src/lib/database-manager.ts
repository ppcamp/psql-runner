import * as vscode from 'vscode';
import { Base } from './base/setuper';
import re from '../utils/regex';
import { Pool, PoolConfig } from 'pg';
import { QueryBuilder } from '../utils/sql';

export class DatabaseManager extends Base {
    private static KeyConnections = 'psql-runner:connections';
    private static KeyCounter = 'psql-runner:counter';

    private secrets: vscode.SecretStorage;

    private counter: number = 1;
    private current?: Pool;
    private connections: PoolConfig[] = [];

    constructor(ctx: vscode.ExtensionContext,) {
        super(ctx);
        // Fetch the current connection from the settings
        // const config = vscode.workspace.getConfiguration('psql-runner');
        // const conn = config.get('currentConnection') as string;
        this.secrets = ctx.secrets;
        this.load();
    }


    private save() {
        const connAsString = JSON.stringify(this.connections);
        this.secrets.store(DatabaseManager.KeyConnections, connAsString);
        this.secrets.store(DatabaseManager.KeyCounter, this.counter.toString());
    }

    private async load() {
        const connAsString = await this.secrets.get(DatabaseManager.KeyConnections);
        if (connAsString) {
            this.connections = JSON.parse(connAsString);
        }

        const counter = await this.secrets.get(DatabaseManager.KeyCounter);
        if (counter) { this.counter = parseInt(counter, 10); }
    }


    public async query(sql: string, values?: any[]) {
        if (!this.current) {
            vscode.window.showWarningMessage('No active connections');
            return;
        }

        try {
            const { query, args } = new QueryBuilder(sql).bind(values);
            const results = await this.current.query(query, args);
            return results;

        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error while querying`, { modal: true, detail: JSON.stringify(err.cause) });
            } else {
                vscode.window.showErrorMessage(`Unknown error while querying`, { modal: true, detail: `${err}` });
            }
        }
    }


    public async createConnection() {

        let name = await Prompts.Name();

        const host = await Prompts.Host();
        if (!host) {
            return;
        }

        const port = await Prompts.Port();
        if (!port) {
            return;
        }

        const database = await Prompts.Database();


        const user = await Prompts.User();
        if (!user) {
            return;
        }

        const password = await Prompts.Password();
        if (!password) {
            return;
        }

        const ssl = await Prompts.SSL();

        if (!name) {
            name = `Connection #${this.counter++} (${host}:${port})`;
        }

        const conn = {
            host,
            port,
            user,
            password,
            ssl,
            application_name: name,
            database,
        } satisfies PoolConfig;

        this.connections.push(conn);
        this.save();

        // vscode.window.showInformationMessage(JSON.stringify(conn));
    }


    /**
     * @todo Should close at the end
     * @param name
     * @returns
     */
    public async connect(name: string) {
        const c = this.connections.find(v => v.application_name === name);
        if (!c) {
            vscode.window.showErrorMessage(`No such connection: ${name}`);
            return;
        }

        if (this.current) {
            try {
                await this.current.end();
            } catch (e) {
                const err = e as Error;
                vscode.window.showErrorMessage(`Error closing previous connection: ${err?.message}`);
                return;
            }
        }

        if (this.current?.options.application_name === name) {
            vscode.window.showInformationMessage(`Disconnected`);
            this.current = undefined;
            return;
        }

        this.current = new Pool({
            ...c,
            application_name: c.application_name,
            keepAlive: true,
        });

        const result = await this.query("SELECT ? as ping;", ['PONG']);
        if (result?.rows.length === 0) {
            vscode.window.showErrorMessage(`Fail to ping`);
        } else {
            vscode.window.showInformationMessage(`Selected: ${JSON.stringify(result?.rows[0])}`);
        }

        return name;
    }


    public async remove(name: string) {
        this.connections = this.connections.filter(v => v.application_name !== name);
        this.save();
        vscode.window.showInformationMessage(`Removed: ${name}`);
    }


    public get name() { return this.current?.options.application_name ?? ''; }
    public get available() {
        return this.connections.map(connection => connection.application_name!);
    }


    public close() {
        // TODO close the current connection
    }
}


const Prompts = {
    Name: async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Connection Name',
            placeHolder: 'postgres',
        });

        return input;
    },

    Host: async () => {
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
    },

    Port: async (): Promise<number | null> => {
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

        if (!input) { return null; }

        return parseInt(input, 10);
    },

    Database: async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Database',
            placeHolder: 'postgres',
        });

        return input;
    },

    User: async () => {
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
    },


    Password: async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Database password',
            placeHolder: 'postgres',
            password: true,
            value: 'postgres',
        });

        return input;
    },

    SSL: async () => {
        const input = await vscode.window.showQuickPick(["Disable", "Enable"], {
            placeHolder: 'SSL',
            canPickMany: false,
            ignoreFocusOut: true,
            matchOnDescription: true,
        });

        return input && input === 'Enable' ? true : false;
    },
};
