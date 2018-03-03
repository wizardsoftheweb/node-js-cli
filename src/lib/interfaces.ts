/**
 * This definition is verbatim from
 * [the official docs](https://www.typescriptlang.org/docs/handbook/decorators.html)
 */
export type ClassDecorator = <T extends { new(...args: any[]): {} }>(constructor: T) => T;

export interface IOptions {
    defaults: {
        [key: string]: any;
    };
    setters: {
        [key: string]: (value: any) => any;
    };
    [key: string]: any;
}
