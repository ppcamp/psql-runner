
export type QueryArgs<T extends object> = T | any[];

type BuilderResponse = { query: string, args: any[] }

/**
 * Generate a query replacement. Note that it doesn't support mixed types
 * in arguments.
 */
export class QueryBuilder<T extends object> {
    private query: string = '';

    constructor(query: string) { this.query = query; }

    public bind(params?: QueryArgs<T>): BuilderResponse {
        if (!params) {
            return { query: this.query, args: [] };
        }

        if (Array.isArray(params)) {
            return this.bindArgs(params);
        } else {
            return this.bindNamed(params);
        }
    }

    private bindNamed(params: T): BuilderResponse {
        let query = this.query.toString();
        let args = [];

        for (const key in params) {
            query = query.replace(/(\@|\:)[\w]+/, `$${args.length + 1}`);
            args.push(params[key]);
        }

        return { query, args };
    }

    private bindArgs(params: any[]): BuilderResponse {
        // const matches = this.query.match(/\$[0-9]+/);

        if (!this.query.includes('?')) {
            return { query: this.query, args: params };
        }

        let query = this.query.toString();
        let args = [];


        for (const p of params) {
            query = query.replace('?', `$${args.length + 1}`);
            args.push(p);
        };

        return { query, args };
    }
}