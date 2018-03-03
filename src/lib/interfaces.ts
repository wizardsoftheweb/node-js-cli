/**
 * This definition is verbatim from
 * [the official docs](https://www.typescriptlang.org/docs/handbook/decorators.html)
 */
export type ClassDecorator = <T extends { new(...args: any[]): {} }>(constructor: T) => T;

export interface Options {
    defaults: {
        [key: string]: any;
    };
    [key: string]: any;
}
