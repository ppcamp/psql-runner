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