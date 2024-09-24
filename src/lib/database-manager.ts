import * as vscode from 'vscode';
import { Setup, Base } from './setuper';


type Connection = {
    name: string;
    description?: string;
    host: string;
    port: number;
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
            port: 5432,
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


    public async createConnection() {

    }


    public async connect(name: string) {
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