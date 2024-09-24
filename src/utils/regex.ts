export const IPV4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$$/;



export function Or(a: RegExp, b: RegExp): RegExp {
    return new RegExp(`${a.source}|${b.source}`);
}


export default {
    IPV4,
    Or,
};