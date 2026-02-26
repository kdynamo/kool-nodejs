
import { generateInvalidArgError, generateInvalidValueError, generateMissingArgError } from "./arg-error.ts";
import type { ArgDefined, ArgKeys, ArgValues, GetArgs, StringOrBoolean } from "./arg-types.js";
import { argv } from 'process';
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

/**
 * Processes the command line arguments using the 
 * provided argument definitions and returns an object
 * containing the node path, script path, and parsed
 * arguments. The first two elements of the 
 * `process.argv` array are typically the node 
 * executable path and the script path, so they are 
 * extracted separately. The remaining arguments are
 * processed using the `processArgs` function, which
 * parses them according to the defined argument
 * specifications.
 * 
 * @param argDefined Argument definition
 * @returns The parsed arguments along with node and script paths
 * @example
 * ```ts
 * const argDefined: ArgDefined[] = [
 *     { args: ['-e', '--exec'], key: 'exec', argCount: 1 },
 *     { args: ['-h', '--help'], key: 'help', argCount: 0 },
 *     { args: ['-v', '--version'], key: 'version', argCount: 0 },
 *     { args: ['-c', '--config'], key: 'config', argCount: 1 },
 *     { args: ['-o', '--output'], key: 'output', argCount: 1 },
 * ];
 * const result = getArgs(argDefined);
 * // result is:
 * // {
 * //     nodePath: '/path/to/node',
 * //     scriptPath: '/path/to/script.js',
 * //     args: {
 * //         exec: 'run',
 * //         help: true,
 * //         version: true,
 * //         config: 'config.json',
 * //         output: 'output.txt',
 * //         remaining: ['file1', 'file2']
 * //     }
 * // }
 * ```
 */
export const getArgs = (argDefined: ArgDefined[]): GetArgs => {
    const [nodePath, scriptPath, ...restArg] = argv;
    const appArgs = processArgs(restArg, argDefined);

    return {
        nodePath,
        scriptPath,
        args: appArgs
    };
};

/**
 * Returns the help message for a boolean argument, showing the different ways to set the 
 * argument to true or false. For example, if the argument is `--verbose`, the 
 * help message would show that you can set it to true with `--verbose` or `--verbose=true`, 
 * and set it to false with `--no-verbose` or `--verbose=false`. 
 * The function also includes the description of the argument if provided in the argument
 * definition.
 * @param argDefined 
 * @returns the help message for a boolean argument
 * @example
 * ```ts
 * const argDefined: ArgDefined = {
 *     args: ['-v', '--verbose'],
 *     key: 'verbose',
 *     argType: ARG_TYPE_BOOLEAN,
 *     description: 'Enables verbose logging'
 * };
 * const helpMessage = getArgHelpBoolean(argDefined);
 * // helpMessage would be:
 * // `
 * // -v              # sets to true
 * // -v={true|false} # sets to true or false
 * // -no-v           # sets to false
 * // --verbose       # sets to true
 * // --verbose={true|false} # sets to true or false
 * // --no--verbose   # sets to false
 * // Argument Description: Enables verbose logging
 * // `
 * ```
 */
export const getArgHelpBoolean = (argDefined: ArgDefined) => {
    const { args = [], description = '' } = argDefined;
    
    let argDescription = '';
    const lengthMax = Math.max(...args.map(arg => arg.length));
    args.forEach((arg: string) => {
        const padding = ' '.repeat(lengthMax - arg.length);
        if (arg.startsWith('--')) {
        argDescription += `
${arg}              ${padding}# sets to true
${arg}={true|false} ${padding}# sets to true or false
--no${arg}          ${padding}# sets to false
`;
        } else if (arg.startsWith('-')) {
            argDescription += `
 ${arg}             ${padding}# sets to true
 ${arg}={true|false}${padding}# sets to true or false
 -no${arg}          ${padding}# sets to false
`;
        }
    });
    argDescription = argDescription.replace(/, $/, '');
    if (description) {
        argDescription += `
Argument Description: ${description}
`;
    }
    return argDescription;
}
