function vs() {
    // @ts-ignore: expected an error
    const vscode: VSCode = acquireVsCodeApi();

    // Send a message back to the extension
    vscode.postMessage({
        command: 'alert',
        text: '🐛  on line ' + 1
    });

    // window.addEventListener('message', event => {
    //     const message = event.data; // The json data that the extension sent
    //     switch (message.command) {
    //         case 'refactor':
    //             currentCount = Math.ceil(currentCount * 0.5);
    //             counter.textContent = `${currentCount}`;
    //             break;
    //     }
    // });
}

