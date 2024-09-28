import * as vscode from 'vscode';
import { Base } from './base/setuper';
import re from '../utils/regex';
import { Pool, PoolConfig, QueryResult } from 'pg';
import { QueryParser } from '../utils/sql';
import { stringify } from '../utils/stringfy';
import Logger from './base/logging';

export class DatabaseManager extends Base {
    private static KeyConnections = 'psql-runner:connections';
    private static KeyCounter = 'psql-runner:counter';

    private secrets: vscode.SecretStorage;

    private counter: number = 1;
    private current?: Pool;
    private connections: PoolConfig[] = [];

    constructor(ctx: vscode.ExtensionContext, log: Logger) {
        super(ctx, log);
        // Fetch the current connection from the settings
        // const config = vscode.workspace.getConfiguration('psql-runner');
        // const conn = config.get('currentConnection') as string;
        this.secrets = ctx.secrets;
        this.load();
    }


    private save() {
        this.log.info('[db] Saving connection information');
        const connAsString = JSON.stringify(this.connections);
        this.secrets.store(DatabaseManager.KeyConnections, connAsString);
        this.secrets.store(DatabaseManager.KeyCounter, this.counter.toString());
    }

    private async load() {
        this.log.info('[db] Loading connections');
        const connAsString = await this.secrets.get(DatabaseManager.KeyConnections);
        if (connAsString) {
            this.connections = JSON.parse(connAsString);
        }

        const counter = await this.secrets.get(DatabaseManager.KeyCounter);
        if (counter) { this.counter = parseInt(counter, 10); }
    }

    private checkConnection(): boolean {
        if (!this.current) {
            vscode.window.showWarningMessage('No active connections');
            return false;
        }
        return true;
    }

    public async query(sql: string, values?: any[]) {
        this.log.info('[db] Query', { sql, values });

        if (!this.checkConnection()) { return null; }

        try {
            const results = await this.current!.query(sql, values);
            this.log.debug('[db] Query results', results);
            return results;
        } catch (err) {
            if (err instanceof Error) {
                this.log.error('[db] Query error', errorDetail(err));
                vscode.window.showErrorMessage(`Error while querying`, {
                    modal: true,
                    detail: errorDetail(err),
                });
            } else {
                this.log.error('[db] Query error', err);
                vscode.window.showErrorMessage(`Unknown error while querying`,
                    { modal: true, detail: stringify(err) },
                );
            }
            return null;
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

        // vscode.window.showInformationMessage(stringfy(conn));
    }

    public async tryDisconnect() {
        if (this.current) {
            try {
                await this.current.end();
                this.current = undefined;
                vscode.window.showInformationMessage(`Disconnected`);
            } catch (e) {
                const err = e as Error;
                vscode.window.showErrorMessage(`Error closing previous connection: ${err?.message}`);
                return;
            }
        }
    }
    /**
     * @todo Should close at the end
     * @param name
     * @returns
     */
    public async connect(name: string): Promise<string | null> {
        const c = this.connections.find(v => v.application_name === name);
        if (!c) {
            this.log.error(`Connection ${name} doesn't not exist`);
            return null;
        }

        await this.tryDisconnect();

        this.current = new Pool({
            ...c,
            application_name: c.application_name,
            keepAlive: true,
        });

        const result = await this.query("SELECT $1 as ping;", ['PONG']);
        if (result?.rows.length === 0 || result?.rows[0]?.ping !== 'PONG') {
            vscode.window.showErrorMessage(`Fail to connect.`);
            this.log.error(`[db] Failed to connect to database ${this.name}`, result);
            return null;
        }

        this.log.debug(`[db] connected to database ${this.name}`);
        return name;
    }


    public async remove(name: string) {
        this.connections = this.connections.filter(v => v.application_name !== name);
        this.save();
        vscode.window.showInformationMessage(`Removed: ${name}`);
        this.log.info(`[db] Removed connection ${this.name}`);
    }


    public get name() { return this.current?.options.application_name ?? ''; }
    public get available() { return this.connections.map(connection => connection.application_name!); }
    // TODO close the current connection
    public close() { }


    public async runQuery(text: string) {
        this.log.debug('[db] Parsing query', { text });

        if (!this.checkConnection()) { return null; }

        const { query, args } = QueryParser(text);

        this.log.debug('[db] Parsed query', { query, args });

        const result = await this.query(text);
        if (!result) {
            return; // no active database
        }
        if (result.rows.length === 0) {
            vscode.window.showInformationMessage('No data found');
            return;
        }

        const columns = columnsFromResult(result);
        const rows = rowsFromResult(columns, result);

        const panel = vscode.window.createWebviewPanel(
            'psql.results', // Identifies the type of the webview. Used internally
            'SQL Results', // Title of the panel displayed to the user
            { viewColumn: vscode.ViewColumn.One, preserveFocus: true }, // Editor column to show the new webview panel in
            { enableScripts: true, enableForms: true } // Webview options
        );
        // Set the HTML content for the webview
        panel.webview.html = Views.result(columns, rows);
        this.log.info(panel.webview.html);
        panel.reveal();
    }
}

function rowsFromResult(columns: string[], result: QueryResult<any>) {
    return result.rows.map(v => columns.map(h => `${v[h]}`));
}

function columnsFromResult(result: QueryResult<any>) {
    return result.fields.map(field => field.name);
}

const Views = {
    result: (columns: Array<string>, rows: Array<Array<string>>) => {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Simple HTML Table</title>
            <style>
                table {
                    width: 100%;
                    border: none;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    text-align: left;
                    padding: 8px;
                }
                th { background-color: #82457c; color: white; }
            </style>
        </head>
        <body>
            <h1>SQL Results</h1>

            <table>
                <thead>
                    ${columns.map(v => `<th>${v}</th>`).join('\n')}
                </thead>
                <tbody>
                    ${rows.map(v => `<tr>${v.map(v => `<td>${v}</td>`).join('\n')}</tr>`).join('\n')}
                </tbody>
            </table>
        </body>
        `.trim();
    }
};

const Prompts = {
    Name: async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Connection Name',
            placeHolder: 'postgres',
            ignoreFocusOut: true,
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
            ignoreFocusOut: true,
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
            ignoreFocusOut: true,
        });

        if (!input) { return null; }

        return parseInt(input, 10);
    },

    Database: async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Database',
            placeHolder: 'postgres',
            ignoreFocusOut: true,
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
            ignoreFocusOut: true,
        });

        return input;
    },


    Password: async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Database password',
            placeHolder: 'postgres',
            password: true,
            value: 'postgres',
            ignoreFocusOut: true,
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


function errorDetail(err: Error): string {
    return `
    Reason: ${err.message},
    Stack: ${err.stack} `.trim();
}