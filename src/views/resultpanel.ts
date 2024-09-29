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
        const template = `
            <h1>SQL Results</h1>

            <table id="dataTable">
            <thead>
                ${columns.map(v => `<th>${v}</th>`).join('\n')}
            </thead>
            <tbody>
                <div>
                    ${columns.map(col => `<td><input type="text" id="${col}" placeholder="Search for ${col}.."></td>`).join('\n')}
                </div>
                ${rows.map(v => `<tr>${v.map(v => `<td>${v}</td>`).join('\n')}</tr>`).join('\n')}
            </tbody>
            </table>

            <script>
            window.addEventListener('load', function() {
                let filters = [${columns.map((_, i) => false).join(',')}];

                ${columns.map((col, index) => `
                        document.getElementById('${col}').addEventListener('keyup', function() {
                            const filter = this.value.toLowerCase().trim();

                            const rows = document.querySelectorAll('#dataTable tbody tr');
                            rows.forEach((row,index) => {
                                if (index === 0) return;

                                const cell = row.getElementsByTagName('td')[${index}];
                                const matchFilter = cell.textContent.toLowerCase().indexOf(filter) > -1;
                                const rowHidden = row.style.display === 'none';

                                if ((matchFilter && !rowHidden) || !filter) {
                                    row.style.display = '';
                                } else {
                                    row.style.display = 'none';
                                }
                            });
                        })`)}
                });
            </script>
        `.trim();

        const html = this.render(template);
        this.show(html);
    }
}