type Message = {
    command: 'alert' | 'warn' | 'info' | undefined
    text: string;
}

type VSCode = {
    postMessage(message: Message): void;
    getState(): any;
    setState(state: any): void;
};