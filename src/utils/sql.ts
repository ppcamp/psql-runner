

type BuilderResponse = { query: string, args: string[] }

const QueryQuestionParam = '[^"]\?[^"]';
const QueryNamedParam = '[^"]\:[\w]+[^"]';
const QueryArgParam = '[^"]\$[0-9]+[^"]';

/**
 * Generate a query replacement. Note that it doesn't support mixed types
 * in arguments.
 */
export function QueryParser(query: string): BuilderResponse {
    // CHECK if query contains "?" or ":named"
    const matcher = new RegExp(`(${QueryArgParam}|${QueryNamedParam}|${QueryQuestionParam})`, 'g');
    const params = query.match(matcher);

    if (!params) { return { query, args: [] }; }

    return bindArgs(query, params);
}


function bindArgs(sql: string, params: string[]): BuilderResponse {
    // if (!this.query.includes('?')) {
    //     return { query: this.query, args: params };
    // }

    // let query = this.query.toString();
    // let args = [];


    // for (const p of params) {
    //     query = query.replace('?', `$${args.length + 1}`);
    //     args.push(p);
    // };

    return { query: sql, args: params };
}

// function bindNamed(sql: string, params: string[]): BuilderResponse {
//     let query = sql.toString();
//     let args = [];

//     for (const param in params) {
//         query = query.replace(/(\@|\:)[\w]+/, `$${args.length + 1}`);
//         args.push(param);
//     }

//     return { query, args };
// }
