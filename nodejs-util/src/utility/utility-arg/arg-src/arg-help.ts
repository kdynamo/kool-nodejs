import { argv } from "process";
import { ArgDefined, GetArgs } from "../arg-types.js";
import { ARG_MULTIPLE_APPEND, ARG_MULTIPLE_REPLACE } from "./arg-const.ts";
import { processArgs } from "./arg-process.ts";

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
    const { args = [], argMessage = '', description = '' } = argDefined;
    let argDescription = argMessage;
    // if argMessage is provided, use it as the argument description. Otherwise, 
    // generate the argument description based on the argument names.
    if (argMessage === '') {
        const lengthMax = Math.max(...args.map(arg => arg.length));
        args.forEach((arg: string) => {
            const padding = ' '.repeat(lengthMax - arg.length);
            if (arg.startsWith('--')) {
                argDescription += `
[ ${arg} ]             ${padding}# sets to true
[ ${arg}={true|false} ] ${padding}# sets to true or false
[ --no${arg} ]         ${padding}# sets to false
`;
            } else if (arg.startsWith('-')) {
                argDescription += `
[ ${arg} ]             ${padding}# sets to true
[ ${arg}={true|false} ] ${padding}# sets to true or false
[ -no${arg} ]          ${padding}# sets to false
`;
            }
        });
    }
    if (description) {
        argDescription += `
Argument Description: ${description}
`;
    }
    return argDescription;
}

/**
 * Returns the help message for an argument with expected values, 
 * showing the different ways to set the argument to one of the expected values.
 * @param argDefined Argument definition, which should include the `expected` property 
 * @returns Argument description with expected values
 * @example
 * ```ts
 * const argDefined: ArgDefined = {
 *     args: ['-t', '--type'],
 *     key: 'type',
 *     argType: ARG_TYPE_STRING,
 *     expected: ['json', 'xml'],
 *     description: 'Specifies the type of the output'
 * };
 * const helpMessage = getArgHelpExpected(argDefined);
 * // helpMessage would be:
 * // `
 * // -t={json|xml}
 * // --type={json|xml}
 * // Argument Description: Specifies the type of the output
 * // `
 * ```
 */
export const getArgHelpExpected = (argDefined: ArgDefined
) => {
    const { args = [], argMessage = '', description = '', expected = [], argMultiple=ARG_MULTIPLE_REPLACE } = argDefined;
    let argDescription = argMessage;
    // if argMessage is provided, use it as the argument description. Otherwise, 
    // generate the argument description based on the argument names.
    const multipleText = (argMultiple === ARG_MULTIPLE_APPEND) ? ' (can be used multiple times)' : '(multiple calls will replace previous value)';
    const multiplePlus = (argMultiple === ARG_MULTIPLE_APPEND) ? '+' : '';
    if (argMessage === '') {
        let expectedText: string = `\{${expected.join(' | ')}\}`;
        const lengthMax = Math.max(...args.map(arg => arg.length));
        args.forEach((arg: string) => {
            const padding = ' '.repeat(lengthMax - arg.length);
            if (arg.startsWith('-')) {
                argDescription += `
 [ ${arg} ${expectedText} ]${multiplePlus}
 [ ${arg}=${expectedText} ]${multiplePlus}
`;            }
        });
    }
    if (description) {
        argDescription += `
Argument Description: ${description}
${multipleText}
`;
    }
    return argDescription;
}