# psql-runner


Is just a simple postgresql extension that allows you to select and run
some SQL queries, and also supports visualize your database and filtering/globing



## Roadmap

- [ ] Add initial setup with connection



```sql
SELECT
    'foo' as bar,
    1 as nnumber
UNION
SELECT
    'fb' as bar,
    3 as nnumber;
```


Examples:
- https://github.com/microsoft/vscode-extension-samples/tree/main/tree-view-sample
- https://code.visualstudio.com/api/extension-guides/tree-view
- https://github.com/alefragnani/vscode-bookmarks/tree/e9240fa7bdc2856c6cf7413e9196b699c5c4efcb