
import { generateInvalidArgError, generateInvalidValueError, generateMissingArgError } from "./arg-error.ts";
import type { ArgDefined, ArgKeys, ArgValues, StringOrBoolean } from "./arg-types.js";

export const ARG_MULTIPLE_APPEND = 'append';
export const ARG_MULTIPLE_REPLACE = 'replace';
export const ARG_TYPE_BOOLEAN = 'boolean';
export const ARG_TYPE_STRING = 'string';

/**
 * Determines the key to assign the value to. If a key is 
 * provided in the argument definition, it uses that key. 
 * Otherwise, it takes the longest argument name from the 
 * `args` array, removes any leading dashes, and uses 
 * that as the key. This allows for flexibility in defining 
 * arguments, where you can either specify a custom key or 
 * let it be derived from the argument names.
 * @param key key specified in the argument definition
 * @param args argument names array from the argument definition, typically containing the short and long forms of the argument (e.g., `-e` and `--exec`). The longest argument name will be used to derive the key if a custom key is not provided.
 * @returns The realized key
 */
export const getArgValueKey = (key: string | undefined = undefined, args: string[] = []) => {
    let keyFinal: string;
    if (key) {
        keyFinal = key;
    } else {
        args.sort((a, b) => b.length - a.length);
        keyFinal = args[0];
        keyFinal = keyFinal.replace(/^-+/, '');
    }
    return keyFinal;
}

/**
 * Assigns all of the argument
 * 
 * @param argDefined arg definitions
 * @returns argKeys
 */
export const getArgKeys = (argDefined: ArgDefined[] = []): ArgKeys => {
    const argKeys: ArgKeys = {};
    argDefined.forEach((argDefine: ArgDefined) => {
        const { args = [] } = argDefine;
        const key = getArgValueKey(argDefine.key, args);
        argDefine.key = key;
        args.forEach((arg: string) => {
            argKeys[arg] = argDefine;
        });
    });
    return (argKeys);
};
/**
 * Pass in the arguments and the definef arguments to process them into an object with
 * the values assigned. Remaining arguments are placed in the `remaining` array.
 * @param args arguments array, usually from `process.argv.slice(2)`
 * @param argDefined arguments defined array
 * @returns argument object with values assigned
 * @example
 * ```ts
 * const argDefined: ArgDefined[] = [
 *     { args: ['-e', '--exec'], key: 'exec', argCount: 1 },
 *     { args: ['-h', '--help'], key: 'help', argCount: 0 },
 *     { args: ['-v', '--version'], key: 'version', argCount: 0 },
 *     { args: ['-c', '--config'], key: 'config', argCount: 1 },
 *     { args: ['-o', '--output'], key: 'output', argCount: 1 },
 * ];
 * const args = ['-e=run', '--help', '-v', '--config=config.json', '-o=output.txt', 'file1', 'file2'];
 * const result = processArgs(args, argDefined);
 * // result is:
 * // {
 * //     exec: 'run',
 * //     help: true,
 * //     version: true,
 * //     config: 'config.json',
 * //     output: 'output.txt',
 * //     remaining: ['file1', 'file2']
 * // }
 * ``` 
 */
export const processArgs = (args: string[], argDefined: ArgDefined[]) => {
    const remaining: StringOrBoolean[] = [];
    const argValues: ArgValues = { remaining };
    const argKeys = getArgKeys(argDefined);

    let argEquals: boolean = false;
    // Parse through the arguments array
    while (args.length > 0) {
        let argNo: boolean = false;
        let arg = args.shift() || '';
        if (arg.match(/^--no-(.*)$/)) {
            argNo = true;
            arg = arg.replace(/^--no-/, '--');
        }
        const argMatch = arg.match(/^(.*?)=(.*)$/);
        if (argMatch?.length === 3) {
            args.unshift(argMatch[2]);
            arg = argMatch[1];
            argEquals = true;
        }

        if (arg.startsWith('-')) {
            const argDefine: ArgDefined = argKeys[arg];
            if (argDefine) {
                const { argType = ARG_TYPE_BOOLEAN, defaultValue, validator } = argDefine;
                const key = getArgValueKey(argDefine.key, argDefine.args);
                if (argType === ARG_TYPE_BOOLEAN) {
                    argValues[key] = !argNo;
                } else {
                    if (args.length > 0) {
                        argValues[key] = args.shift() ?? defaultValue ?? '';
                        if (validator && !validator(argValues[key], argDefine, argValues)) {
                            throw generateInvalidValueError(key, String(argValues[key]), argDefine);
                        }
                    } else {
                        throw generateMissingArgError(arg, argDefine);
                    }
                }
            } else {
                throw generateInvalidArgError(arg);
            }
        } else {
            argValues['remaining'] = [...argValues['remaining'], arg satisfies string];
        }
    }
    return argValues;
};
