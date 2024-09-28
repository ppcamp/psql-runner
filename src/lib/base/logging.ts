import * as vscode from 'vscode';
import * as winston from 'winston';
import { LogOutputChannelTransport } from 'winston-transport-vscode';
import { Deinitializer } from './setuper';

interface ILogger {
    info: (msg: string, ...meta: any[]) => void;
    warn: (msg: string, ...meta: any[]) => void;
    verbose: (msg: string, ...meta: any[]) => void;
    error: (msg: string, ...meta: any[]) => void;
    debug: (msg: string, ...meta: any[]) => void;
};


export default class Logger implements ILogger, Deinitializer {
    private logger: winston.Logger;
    private disposable: vscode.Disposable;

    constructor(ctx: vscode.ExtensionContext) {
        // Create a Log Output Channel for your extension with the VS Code API
        const outputChannel = vscode.window.createOutputChannel('psql-runner', { log: true, });
        this.disposable = outputChannel;
        ctx.subscriptions.push(outputChannel);

        // 3. Create the Winston logger giving it the Log Output Channel
        this.logger = winston.createLogger({
            level: 'trace', // Recommended: set the highest possible level
            levels: LogOutputChannelTransport.config.levels, // Recommended: use predefined VS Code log levels
            format: LogOutputChannelTransport.format(), // Recommended: use predefined format
            transports: [new LogOutputChannelTransport({ outputChannel })],
        });
    }

    public deinit() { this.disposable.dispose(); this.logger.destroy(); }

    public info(msg: string, ...meta: any[]) { this.logger.info(msg, ...meta); }
    public warn(msg: string, ...meta: any[]) { this.logger.info(msg, ...meta); }
    public verbose(msg: string, ...meta: any[]) { this.logger.info(msg, ...meta); }
    public error(msg: string, ...meta: any[]) { this.logger.info(msg, ...meta); }
    public debug(msg: string, ...meta: any[]) { this.logger.info(msg, ...meta); }
}