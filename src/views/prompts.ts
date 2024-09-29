import * as vscode from 'vscode';
import re from '../utils/regex';

export const Name = async () => {
    const input = await vscode.window.showInputBox({
        prompt: 'Connection Name',
        placeHolder: 'postgres',
        ignoreFocusOut: true,
    });

    return input;
};

export const Host = async () => {
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
};

export const Port = async (): Promise<number | null> => {
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
};

export const Database = async () => {
    const input = await vscode.window.showInputBox({
        prompt: 'Database',
        placeHolder: 'postgres',
        ignoreFocusOut: true,
    });

    return input;
};

export const User = async () => {
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
};

export const Password = async () => {
    const input = await vscode.window.showInputBox({
        prompt: 'Database password',
        placeHolder: 'postgres',
        password: true,
        value: 'postgres',
        ignoreFocusOut: true,
    });

    return input;
};

export const SSL = async () => {
    const input = await vscode.window.showQuickPick(["Disable", "Enable"], {
        placeHolder: 'SSL',
        canPickMany: false,
        ignoreFocusOut: true,
        matchOnDescription: true,
    });

    return input && input === 'Enable' ? true : false;
};

export default {
    Name,
    Host,
    Port,
    Database,
    User,
    Password,
    SSL,
};