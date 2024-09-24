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
    private static KeyConnections = 'psql-runner:connections';
    private static KeyCounter = 'psql-runner:counter';

    private secrets: vscode.SecretStorage;

    private counter: number = 1;
    private current: string = "";
    private connections: Connection[] = [];

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


        const username = await Prompts.User();
        if (!username) {
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
            username,
            password,
            ssl,
            name,
            database,
        } as Connection;

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
        vscode.window.showInformationMessage(`You selected: ${name}`);

        const c = this.connections.find(v => v.name === name);
        if (!c) {
            vscode.window.showInformationMessage(`No such connection: ${name}`);
            return;
        }

        // TODO close the connection

        this.current = c.name;
    }


    public async remove(name: string) {
        this.connections = this.connections.filter(v => v.name !== name);
        this.save();
        vscode.window.showInformationMessage(`Removed: ${name}`);
    }


    public get name() { return this.current.toString(); }
    public get available() { return this.connections.map(connection => connection.name); }


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

    Port: async () => {
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
