import { ArgDefined } from "./arg-types.js";
import { ARG_TYPE_BOOLEAN } from "./utility-arg.ts";

/**
 * Custom error class for invalid arguments.
 * Extends the built-in Error class to provide a specific error type for argument validation issues.
 */
export class InvalidArgError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArgError';

    // Set the prototype explicitly to ensure instanceof checks work correctly
    // See the TypeScript FAQ for more information: 
    Object.setPrototypeOf(this, InvalidArgError.prototype);
  }
}

/**
 * Triggers when an argument value does not match the expected type or format.
 * @param value value assigned
 * @param expected expected value
 * @param argDefined argument definition, used to provide additional context in the error message, such as description and possible argument names.
 * @returns InvalidArgError with a detailed message about the invalid argument, 
 * including the expected value, the actual value provided, and any 
 * relevant descriptions from the argument definition.
 */
export const generateInvalidValueError = (
  value: string,
  expected: string,
  argDefined?: ArgDefined
) => {   
  const { description, args } = argDefined || {};
  const arg = args ? args.join(' or ') : '';
  const descriptionPart = description ? `\n${description}` : '';
  return new InvalidArgError(`Invalid value for argument '${arg}': expected ${expected}, got '${value}'${descriptionPart}`);  
}

/**
 * Generates an error when a required argument is missing a value. 
 * This function constructs a detailed error message that includes 
 * the argument name, the expected number of values, and any r
 * elevant descriptions from the argument definition.
 * @param arg argument name that is missing a value
 * @param argDefined argument definitioon
 * @returns InvalidArgError with a detailed message about the invalid argument, 
 * including the expected value, the actual value provided, and any 
 * relevant descriptions from the argument definition. 
 */
export const generateMissingArgError = (arg: string, argDefined: ArgDefined) => {   
  const { argType = ARG_TYPE_BOOLEAN, description, args } = argDefined;
  const descriptionPart = description ? `\n${description}` : '';
  return new InvalidArgError(`Missing value for argument '${arg}' (expected 1 value, got 0)${descriptionPart}`);  
}

/**
 * Invalid argument error generator, used when an argument is not recognized or
 * does not match any defined arguments.
 * @param arg argument name that is invalid or not recognized
* @returns InvalidArgError with a detailed message about the invalid argument, 
 * including the expected value, the actual value provided, and any 
 * relevant descriptions from the argument definition. 
 */
export const generateInvalidArgError = (arg: string) => (  
  new InvalidArgError(`Invalid Argument ${arg}`)  
);
