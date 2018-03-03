export function Option(defaultValue?: any, setter?: (value: any) => any) {
    return (target: any, propertyName: string) => {
        target.options = target.options || { defaults: {} };
        target.options.defaults = (
            target.options.defaults
            || /* istanbul ignore next: doesn't happen */ {}
        );
        target.options.defaults[propertyName] = (
            defaultValue === undefined
                ? null
                : defaultValue
        );
        target.options.setters = (
            target.options.setters
            || /* istanbul ignore next: doesn't happen */ {}
        );
        target.options.setters[propertyName] = (
            setter === undefined
                ? (value: any) => {
                    return value;
                }
                : setter
        );
        target.options[propertyName] = target.options.defaults[propertyName];
    };
}
