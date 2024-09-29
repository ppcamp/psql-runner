import * as vscode from 'vscode';
import { QueryResult } from 'pg';
import { BaseResultPanel } from './base/panel';

export class ResultPanel extends BaseResultPanel {
    constructor(ctx: vscode.ExtensionContext) { super(ctx, 'Result', 'result-view'); }

    protected override onMessage(msg: Message): void {
        switch (msg.command) {
            case 'alert':
                vscode.window.showErrorMessage(msg.text);
                return;
            case 'info':
                vscode.window.showErrorMessage(msg.text);
                return;
            case 'warn':
                vscode.window.showWarningMessage(msg.text);
                return;
            default:
                vscode.window.showErrorMessage(msg.text);
        }
    };

    private rowsFromResult(columns: string[], result: QueryResult<any>) { return result.rows.map(v => columns.map(h => `${v[h]}`)); }
    private columnsFromResult(result: QueryResult<any>) { return result.fields.map(field => field.name); }

    public update(result: QueryResult<any>) {
        const cols = this.columnsFromResult(result);
        const rows = this.rowsFromResult(cols, result);

        this.showTableResult(cols, rows);
    }

    // FIXME: show lines after clearing filters
    private showTableResult(columns: Array<string>, rows: Array<Array<string>>) {
        const id = (c: string) => `tableResult-${c}`;

        const tinputs = columns.
            map(c => `<td><input type="text" id="${id(c)}" placeholder="Search for ${c}.."></td>`).
            join('\n');
        const theaders = columns.
            map(c => `<th>${c}</th>`).
            join('\n');
        const trows = rows.
            map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('\n')}</tr>`).
            join('\n');

        const template = `
            <h1>SQL Results</h1>
            <table id="dataTable">
                <thead>${theaders}</thead>
                <tbody>
                    <tr>${tinputs}</tr>
                    ${trows}
                </tbody>
            </table>
        `.trim();

        const onLoad = `
            let filters = [${columns.map((_) => false).join(',')}];
            ${columns.map((c, i) => `registerTableFilter('dataTable','${id(c)}', ${i})`).join(';\n')}
        `.trim();

        const html = this.render(template, onLoad);
        this.show(html);
    }
}