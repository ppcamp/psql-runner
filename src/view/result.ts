
// FIXME: show lines after clearing filters
export function tableResult(columns: Array<string>, rows: Array<Array<string>>) {
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
                input {
                    background-color: inherit;
                    color: white;
                    border: none;
                    border-bottom: 2px solid white;
                    box-shadow: none;
                }
            </style>
        </head>
        <body>
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
        </body>
        `.trim();
}