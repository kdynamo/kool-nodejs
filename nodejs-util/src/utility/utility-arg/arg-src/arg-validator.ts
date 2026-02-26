import { ArgDefined, ArgValues, StringOrBoolean } from "../arg-types.js";
import { ARG_MULTIPLE_APPEND, ARG_MULTIPLE_REPLACE } from "./arg-const.ts";

/**
 *  Checks if the provided value(s) match any of the expected values defined in the argument definition.
 *  This function is used for validating argument values against a predefined set of expected values. 
 *  It converts the provided value(s) to strings and checks if they are included in the expected values array. 
 *  If the expected values are defined as an array, it checks if every value in the provided array matches any of the expected values. 
 *  If the expected values are defined as a single string, it checks if the provided value matches that string.     
 * 
 * @param value value to validate, which can be a string or an array of strings, depending on the argument definition. The function will convert the value(s) to strings for comparison against the expected values.    
 * @param expected expected value
 * @returns === true if the value matches any of the expected values, otherwise false. If the expected values are defined as an array, it returns true only if every value in the provided array matches any of the expected values. If the expected values are defined as a single string, it returns true if the provided value matches that string.
 * @example
 * ```ts
 * const expected = ['json', 'xml'];
 * console.log(isExpectedValid('json', expected)); // true
 * console.log(isExpectedValid('xml', expected)); // true
 * console.log(isExpectedValid('yaml', expected)); // false
 * console.log(isExpectedValid(['json', 'xml'], expected)); // true
 * console.log(isExpectedValid(['json', 'yaml'], expected)); // false
 * ```
 */
export const isValueValid = (value: string | string[] = [], expected: string[] = []): boolean => {
    const valueArray = Array.isArray(value) ? value : (value ? [value] : []);
    let found: boolean = false;

    if (valueArray.length === 0) {
        found = false;
    } else if (expected.length === 0) {
        found = true; // if no expected values are defined, consider any value as valid
    } else if (expected.length > 0) {
        found = valueArray.every((value: string) => expected.includes(value));
    }
    return found;
}

/**
 * Validates the argument value(s) against the expected values defined in the argument definition.
 * This function checks if the provided value(s) match any of the expected values defined in the argument definition. 
 * It handles both single values and arrays of values, depending on the `argMultiple` property in the argument definition. 
 * If the `argMultiple` property is set to 'replace', it checks if the first value in the provided array matches any of the expected values. 
 * If the `argMultiple` property is set to 'append', it checks if every value in the provided array matches any of the expected values. 
 * If the expected values are not defined, it returns true by default, allowing any value to be considered valid.       
 *  
 * @param value value to validate
 * @param argDefined argument definition
 * @param argValues current parsed argument values, which can be used for reference during validation. This allows the validator to access other argument values if needed for more complex validation logic.
 * @returns === true if the value(s) match any of the expected values defined in the argument definition, otherwise false. If the expected values are not defined, it returns true by default. If the `argMultiple` property is set to 'replace', it checks if the first value in the provided array matches any of the expected values. If the `argMultiple` property is set to 'append', it checks if every value in the provided array matches any of the expected values.
 * @example
 * ```ts
 * const argDefined: ArgDefined = {
 *     expected: ['json', 'xml'],
 *     argMultiple: 'append'
 * };
 * console.log(expectedValidator('json', argDefined, {})); // true
 * console.log(expectedValidator('xml', argDefined, {})); // true
 * console.log(expectedValidator('yaml', argDefined, {})); // false
 * console.log(expectedValidator(['json', 'xml'], argDefined, {})); // true
 * console.log(expectedValidator(['json', 'yaml'], argDefined, {})); // false
 * ```
 */
export const expectedValidator = (
    value: StringOrBoolean | StringOrBoolean[] = [],
    argDefined: ArgDefined,
    argValues: ArgValues
 ): boolean => {
    const { expected = [], argMultiple = ARG_MULTIPLE_APPEND } = argDefined;
    const expectedArray = Array.isArray(expected) ? expected : (expected ? [expected] : []);
    const valueArray: string[] = Array.isArray(value) ? value.map(v => String(v)) : (value ? [String(value)] : []);
    let valid = true;
    if (valueArray.length === 0) {
        valid = false;
    } else if (expectedArray.length > 0) {
        if (argMultiple === ARG_MULTIPLE_REPLACE && valueArray.length > 0 ) {
            valid = isValueValid(valueArray[0], expectedArray);
        } else if (argMultiple === ARG_MULTIPLE_APPEND) {
            valid = isValueValid(valueArray, expectedArray);
        }
    } 
    return valid;
}

