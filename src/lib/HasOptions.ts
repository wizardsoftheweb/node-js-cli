import { ClassDecorator, Options } from "./interfaces";

export function HasOptions(): ClassDecorator {
    return function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T): T {
        return class extends constructor {
            public options: Options = { defaults: {} };
            constructor(...args: any[]) {
                super(...args);
            }
        }
    }
}
