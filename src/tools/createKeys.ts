export function createKeys<T extends Record<string, any>>(obj: T) {
    return Object.keys(obj).reduce((acc, key) => {
        (acc as any)[key.toUpperCase()] = key;
        return acc;
    }, {} as { [K in keyof T as Uppercase<string & K>]: K });
}
