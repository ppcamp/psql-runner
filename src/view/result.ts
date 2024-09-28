
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
            </style>
        </head>
        <body>
            <h1>SQL Results</h1>

            <table id="dataTable">
            <thead>
                ${columns.map(v => `<th>${v}</th>`).join('\n')}
            </thead>
            <tbody>
                <tr>
                    ${columns.map(col => `<td><input type="text" id="${col}" placeholder="Search for ${col}.."></td>`).join('\n')}
                </tr>
                ${rows.map(v => `<tr>${v.map(v => `<td>${v}</td>`).join('\n')}</tr>`).join('\n')}
            </tbody>
            </table>

            <script>
            window.addEventListener('load', function() {
                ${columns.map(col => `
                        document.getElementById('${col}').addEventListener('keyup', function() {
                            const filter = this.value.toLowerCase();
                            const rows = document.querySelectorAll('#dataTable tbody tr');

                            rows.forEach(row => {
                                const cells = row.getElementsByTagName('td');
                                let rowContainsFilter = false;

                                for (let i = 0; i < cells.length; i++) {
                                    const cell = cells[i];
                                    if (cell.textContent.toLowerCase().indexOf(filter) > -1) {
                                        rowContainsFilter = true;
                                        break;
                                    }
                                }

                                if (rowContainsFilter) {
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