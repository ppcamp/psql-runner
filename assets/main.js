/**
 * @typedef {'alert' | 'warn' | 'info' | undefined} Command
 */

/**
 * @typedef {Object} Message
 * @property {Command} command - The command type (alert, warn, info, or undefined).
 * @property {string} text - The message text.
 */

/**
 * @typedef {Object} VSCode
 * @property {function(Message): void} postMessage - Sends a message.
 * @property {function(): any} getState - Retrieves the current state.
 * @property {function(any): void} setState - Sets the current state.
 */

/** @type {VSCode} */
const vscode = acquireVsCodeApi();

function vs() {
    // @ts-ignore: expected an error
    // const vscode: VSCode = acquireVsCodeApi();
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
/**
 *
 * @param {HTMLElement} el
 * @param {(e:KeyboardEvent)=>void} cb
 */
function onKeyEnter(el, cb) {
    el.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            cb(event);
        }
    });
}

/**
 *
 * @param {string} baseId
 * @param {string} id
 * @param {number} colIndex
 */
function registerTableFilter(baseId, id, colIndex) {
    /** @type {HTMLInputElement}*/
    const el = document.getElementById(id);

    console.log("registerTableFilter", baseId, id, colIndex);

    onKeyEnter(el, () => {
        const value = el.value.toLowerCase().trim();
        console.log("registerTableFilter", "clicked enter", value);

        // Send a message back to the extension
        // vscode.postMessage({
        //     command: 'alert',
        //     text: '🐛 ' + value,
        // });

        const rows = document.querySelectorAll(`#${baseId} tbody tr`);

        rows.forEach((row, i) => {
            if (i === 0) { return; }

            const cell = row.getElementsByTagName('td')[colIndex];
            const matchFilter = cell.textContent.toLowerCase().indexOf(value) > -1;
            const rowHidden = row.style.display === 'none';

            if ((matchFilter && !rowHidden) || !value) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

