# psql-runner

> For now, I don't plan to keep going on developing this. Maybe in a future,
> when I have some time, I'll go back to it, to add some cool things.

Is just a simple postgresql extension that allows you to select and run
some SQL queries, and also supports visualize your database and filtering/globing.

> you could achieve something similar to the original proposal, by doing some
> changes in the [sqltools extension]. The original documentation didn't provide
> much infos on this.
>
> In general,
>
> ```js
> {
>     // ... others configs
>     "sqltools.queryParams.enableReplace": false, // enables string replacement.
>     // the following regex, will match named params in your variables files
>     "sqltools.queryParams.regex": "\\$[\\d]+|([@:$][\\w]+)",
>
>     // a connection example...
>     "sqltools.connections": [
>         {
>             "previewLimit": 50,
>             "server": "localhost",
>             "port": 5432,
>             "driver": "PostgreSQL",
>             "name": "MyDb",
>             "group": "Locals",
>             "database": "world-db",
>             "username": "world",
>             "password": "world123",
>             "askForPassword": false,
>             "variables": {
>                 ":name": "'%e%'",
>             }
>         }
>     ]
> }
> ```

It only supports one connection per time. Thus, if you click on the same connection
or if you click on another connection, it'll close the current one.

![input](/docs/image/input.png)

![output](/docs/image/output.png)

### Known bugs

-   [ ] after filtering in the result panel, it doesn't allow "unfilter"

It doesn't support columns

## Sample database

```bash
docker run -d -p xxxx:5432 ghusta/postgres-world-db:2.12
```

See more at [world postgres db]

| config   | value    |
| -------- | -------- |
| database | world-db |
| user     | world    |
| password | world123 |

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

-   https://github.com/microsoft/vscode-extension-samples/tree/main/tree-view-sample
-   https://code.visualstudio.com/api/extension-guides/tree-view
-   https://github.com/alefragnani/vscode-bookmarks/tree/e9240fa7bdc2856c6cf7413e9196b699c5c4efcb

[sqltools extension]: https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools
[world postgres db]: https://github.com/ghusta/docker-postgres-world-db
