/**
 *
 * @param process
 * @returns
 *
 * @example
 * // If the command line arguments are: node app.js --name=John --age=30
 * const args = utilityArg(process);
 * console.log(args); // Output: { name: 'John', age: '30' }
 *
 * @example
 * // If the command line arguments are: node app.js --city=NewYork --country=USA
 * const args = utilityArg(process);
 * console.log(args); // Output: { city: 'NewYork', country: 'USA' }
 */
import { ArgDefined } from "./utility-arg";
export declare const processArgs: (args: string[], argDefined: ArgDefined[]) => ArgValues;
