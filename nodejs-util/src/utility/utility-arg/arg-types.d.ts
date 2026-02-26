/**
 * @auther Kevin A. Downing
 * @description Type definitions for the utility-arg module, which provides functionality for parsing command line arguments in Node.js applications.
 * The `ArgDefined` interface defines the structure for expected command line arguments, including their keys, description, and optional parameters.
 * The `ArgValues` interface defines the structure for the parsed command line arguments, where the keys are the argument names and the values can be either strings or booleans.
 * The `ArgMuliple` type defines the possible values for handling multiple occurrences of the same argument, such as 'append' or 'replace'.
 */
export type ArgMultiple = 'appemd' | 'replace';
/**
 * 
 * @auther Kevin A. Downing
 * @description Utility for parsing command line arguments.
 * The `ArgDefined` type defines the structure for expected command line arguments, including their keys, description, and optional parameters.
 * The `ArgValues` interface defines the structure for the parsed command line arguments, where the keys are the argument names and the values can be either strings or booleans.
 * The values in the array are:
 *  * array of arguments, usually prefixed with `--` or `-`
 *  * specifies the key that will store the value of the argument in the resulting object
 *  * optional parameter for the number of values expected for the argument (default is 0)
 *  * optional default value for the argument
 * 
 *    
 * @see https://nodejs.org/en/docs/guides/command-line-arguments/
 * @example
 * // If the command line arguments are: node app.js --city=NewYork --country=USA
 * const args = utilityArg(process);
 */
export interface ArgDefined {
    /**
     * List of command line arguments typically: -<signle character> and/or --<multiple charactewr>
     */
    args: string[];

    /**
     * The key that will be used to store the value of the argument in the 
     * resulting object. If key is not specified, the longest argument 
     * name will be used as the key, with any leading dashes removed.
     * For example, if the argument is `--name=John`, the key would be `name`.
     */
    key?: string;

    /**
     * The type of the argument value, which can be either 'string' or 'boolean'.
     * If 'string' is specified, the argument will be specified either as 
     * `--arg=value` or `--arg value`. If 'boolean' is specified, the argument will 
     * be treated as a flag that can be set to true or false. Calling the flag without 
     * a value will set it to true, while calling it with `--no-` prefix or '-no' will set it to 
     * false. With --arg=true or --arg=false, the value will be set accordingly.
     * For example, if the argument is `--verbose`, the argType would be 'boolean'. 
     * If the argument is `--name=John`, the argType would be 'string'.
     */
    argType?: 'string' | 'boolean';
   
    /**
     * Defines how to handle multiple occurrences of the same argument. 
     * For example, if the argument is `--tag=tag1 --tag=tag2` and the 
     * argMultiple is set to 'append', the resulting object would be
     *  `{ tag: ['tag1', 'tag2'] }`. If the argMultiple is 
     * set to 'replace', the resulting object would be `{ tag: 'tag2' }`.
     * Defsault: 'replace'
     */
    argMultiple?: ArgMultiple;

    /**
     * Default Value to assign if an argument is not provided. For example, if the 
     * argument is `--name=John` and the defaultValue is `Unknown`, 
     * the resulting object would be `{ name: 'John' }`. If the argument is not provided, the resulting object would be `{ name: 'Unknown' }`.
     */
    defaultValue?: StringOrBoolean | StringOrBoolean[];

    /**
     * Expected value(s) for the argument. This is used for validation and help messages.
     * For example, if the argument is `--type` and the expected values are `['json', 'xml']`, 
     * the help message would show that the expected values are `json` or `xml`.
     */
    expected?: string | string[];

    /**
     * A description of the command line argument, which can be used for generating 
     * help messages or documentation. For example, if the argument is `--name`, 
     * the description could be `The name of the user`.
     */
    description?: string; 

    /**
     * A description of the argument value, which can be used for generating help messages
     * or documentation. If the description is not provided, the expected values will be used 
     * as the argument description. For example, if the argument is `--type` and the expected 
     * values are `['json', 'xml']`, the argDescription could be `The type of the output 
     * (json or xml)`.
     */
    argMessage?: string;

    /**
     * Validates the data for the argument. For example, if the argument is `--age=30`, the validator could check if the value is a number and within a certain range. The validator function receives the value of the argument, the defined arguments, and the current parsed argument values, and should return a boolean indicating whether the value is valid or not.
     * @param arg The argument key that is being validated. This is the key defined in the `ArgDefined` object, which can be used to reference the argument's configuration during validation.
     * @param value The value of the argument to validate. This can be a string or an array of strings, depending on the `argCount` defined for the argument.
     * @param argDefined    The array of defined arguments, which can be used to reference other arguments or their configurations during validation.
     * @param argValues The defined argument values that have been parsed so far, which can be used to reference other argument values during validation.
     * @returns === true if the value is valid, otherwise false. If the validator returns false, an error will be thrown indicating that the argument value is invalid.
     */
    validator?: (value: StringOrBoolean | StringOrBoolean[], argDefined: ArgDefined, argValues: ArgValues ) => boolean;
}

/**
 * @auther Kevin A. Downing
 * @description Interface for the parsed command line arguments.
 * The keys are the argument names and the values are either strings or booleans.
 * For example, if the command line arguments are: node app.js --name=John --verbose
 * The resulting object would be: { name: 'John', verbose: true }
 */
export type StringOrBoolean = string | boolean;

/**
 * @auther Kevin A. Downing
 * @description  
 * --name=John --verbose extraArg
 */
export interface ArgKeys {
    [key: string]: ArgDefined;
}

/**
 * @auther Kevin A. Downing
 */
export interface ArgValues {
    
    [key: string]: StringOrBoolean | StringOrBoolean[];
    remaining: StringOrBoolean[];
};

/**
 * @auther Kevin A. Downing
 * @description Interface for the arguments passed to 
 * the `getArgs` function, which is responsible for 
 * parsing the command line arguments based on the d
 * efined argument configurations. The `nodePath` 
 * is the path to the Node.js executable, `scriptPath` 
 * is the path to the script being executed, and `args` 
 * is an object containing the parsed argument values.
 */
export interface GetArgs {
   nodePath: string;
   scriptPath: string;
   args: ArgValues;
}