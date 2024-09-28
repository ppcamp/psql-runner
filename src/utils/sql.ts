

type BuilderResponse = { query: string, args?: string[] }

const QueryQuestionParam = '(?<!")(\\?)(?!")';
const QueryNamedParam = '(?<!")(\\:[\\w]+)(?!")';
const QueryArgParam = '(?<!")\\$[0-9]+(?!")';

/**
 * Generate a query replacement. Note that it doesn't support mixed types
 * in arguments.
 */
export function QueryParser(query: string): BuilderResponse {
    let reMatcher = new RegExp(`${QueryQuestionParam}|${QueryNamedParam}|${QueryArgParam}`, 'g');

    // Plain query with no parameters
    if (!reMatcher.test(query)) {
        return { query };
    }

    let numberedParam = QueryArgParam.match(query);
    // if it's a unamed parameter, then just return the number of elements and its names
    if (numberedParam) {
        return { query, args: numberedParam };
    }

    // CHECK if query contains "?" or ":named"
    let sql = query.toString();
    let params: string[] = [];
    let index = 0;

    reMatcher = new RegExp(`${QueryQuestionParam}|${QueryNamedParam}`, 'g');
    while (true) {
        const pos = reMatcher.exec(query);
        if (!pos) { break; }
        sql = replaceAt(query, pos.index, pos.index + pos.length, `$${++index}`);
        params.push(pos[0]);
    }

    return { query: sql, args: params };
}


function replaceAt(query: string, start: number, end: number, replacement: string) {
    return query.substring(0, start) + replacement + query.substring(end);
}