export function Option(defaultValue?: any) {
    return (target: any, propertyName: string) => {
        target.options = target.options || { defaults: {} };
        target.options.defaults[propertyName] = (
            defaultValue === undefined
                ? null
                : defaultValue
        );
        target.options[propertyName] = target.options.defaults[propertyName];
    };
}
