import { ClassDecorator, IOptions } from "./interfaces";

export function HasOptions(): ClassDecorator {
    return function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T): T {
        return class extends constructor {
            public options: IOptions;
            constructor(...args: any[]) {
                super(...args);
                this.options = this.options || { defaults: {} };
            }

            public updateOption(optionName: string, value: any) {
                this.options[optionName] = value;
            }

            public resetOptions() {
                const defaults = this.options.defaults || {};
                this.options = { defaults };
                for (const key in defaults) {
                    /* istanbul ignore else: convention */
                    if (defaults.hasOwnProperty(key)) {
                        this.options[key] = defaults[key]
                    }
                }
            }
        };
    };
}
