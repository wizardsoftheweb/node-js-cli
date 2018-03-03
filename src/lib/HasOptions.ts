import { ClassDecorator, IOptions } from "./interfaces";

export function HasOptions(): ClassDecorator {
    return function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T): T {
        return class extends constructor {
            public options: IOptions;
            constructor(...args: any[]) {
                super(...args);
                this.options = this.options || {
                    defaults: {},
                    setters: {},
                };
            }

            public updateOption(optionName: string, value: any) {
                this.options[optionName] = this.options.setters[optionName](value);
            }

            public resetOptions() {
                let defaults, setters;
                if (this.options && this.options.defaults) {
                    defaults = this.options.defaults;
                } else {
                    defaults = {}
                }
                if (this.options && this.options.setters) {
                    setters = this.options.setters;
                } else {
                    setters = {}
                }
                this.options = { defaults, setters };
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
