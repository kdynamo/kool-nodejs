import { ARG_TYPE_BOOLEAN, ARG_TYPE_STRING, expectedValidator, getArgHelpBoolean, getArgHelpExpected, getArgKeys, getArgValueKey, isValueValid, processArgs } from "./utility-arg.ts";
import type { ArgDefined } from "./arg-types.d.ts";

describe('utility-arg', () => {
    const argDefined: ArgDefined[] = [
        { args: ['-e', '--exec'], key: 'exec', argType: ARG_TYPE_STRING, description: 'Executes the specified command' },
        { args: ['-h', '--help'], key: 'help', argType: ARG_TYPE_BOOLEAN, description: 'Displays help information about the command-line arguments' },
        { args: ['-v', '--version'], key: 'version', argType: ARG_TYPE_BOOLEAN, description: 'Displays the version of the application' },
        { args: ['-c', '--config'], key: 'config', argType: ARG_TYPE_STRING, description: 'Specifies the configuration file to use' },
        { args: ['-o', '--output'], key: 'output', argType: ARG_TYPE_STRING, description: 'Specifies the output file to write to' },
        { args: ['-f', '--flag'], key: 'flag', argType: ARG_TYPE_BOOLEAN, defaultValue: false, argMessage: '-f=<boolean>', description: 'Sets a flag with two values' }
    ];
    it('getArgValueKey', () => {
        expect(getArgValueKey('exec', ['-e', '--exec'])).toBe('exec');
        expect(getArgValueKey(undefined, ['-e', '--exec'])).toBe('exec');
    });
    it('getArgKeys', () => {
        const argKeys = getArgKeys(argDefined);
        expect(Object.keys(argKeys).length).toBe(12);
    });
    it('should parse command line arguments into an object', () => {

        const args = ['-e=run', '--help', '-v', '--config=config.json', '-o=output.txt', 'file1', 'file2'];
        const result = processArgs(args, argDefined);
        expect(result).toEqual({
            exec: 'run',
            help: true,
            version: true,
            config: 'config.json',
            output: 'output.txt',
            remaining: ['file1', 'file2']
        });

    });

    it('throws an error when expected one argument and got 0', () => {
        const args = ['-o'];

        try {
            const result = processArgs(args, argDefined);
            // Fail test if above expression doesn't throw anything.
            expect(true).toBe(false);
        } catch (e: any) {
            expect(e.message).toBe('Missing value for argument \'-o\' (expected 1 value, got 0)\nSpecifies the output file to write to');
        }
    });
    // it('throws an error when expected two argument and got 0', () => {
    //     const args = ['-f'];

    //     try {
    //         const result = processArgs(args, argDefined);
    //         // Fail test if above expression doesn't throw anything.
    //         expect(true).toBe(false);
    //     } catch (e: any) {
    //         expect(e.message).toBe('Missing value for argument \'-f\' (expected 2 values, got 0)');
    //     }
    // });
    it('get boolean standard help message', () => {
        const result = getArgHelpBoolean(argDefined[2]);
        const descriptionMatch = result.match(/Displays the version of the application/);
        expect(descriptionMatch).not.toBeNull();
        const expectedValuesMatch = result.match(/ -no-v/);
        expect(expectedValuesMatch).not.toBeNull();
        const expectedValuesMatch2 = result.match(/--no--version/);
        expect(expectedValuesMatch2).not.toBeNull();
        const expectedValuesMatch3 = result.match(/-v=\{true|false\}/);
        expect(expectedValuesMatch3).not.toBeNull();
    });

    it('get boolean help with specified arg message', () => {
        const result = getArgHelpBoolean(argDefined[5]);
        // expect(result).toMatch(/Sets a flag with two valuess/);
        const descriptionMatch = result.match(/\-f=\<boolean\>/);
        expect(descriptionMatch).not.toBeNull();
    });

    it('get expected help message with generated expected values', () => {
        const argDefinedWithExpected: ArgDefined = { args: ['-t', '--type'], key: 'type', argType: ARG_TYPE_STRING, expected: ['json', 'xml'], description: 'Specifies the type of the output' };
        const result = getArgHelpExpected(argDefinedWithExpected);
        const descriptionMatch = result.match(/Specifies the type of the output/);
        expect(descriptionMatch).not.toBeNull();
        const expectedValuesMatch = result.match(/ -t=\{json|xml\}/);
        expect(expectedValuesMatch).not.toBeNull();
    });

    it('get expected help message with custom arg description', () => {
        const argDefinedWithExpected: ArgDefined = { args: ['-t', '--type'], key: 'type', argMessage: 'Custom Arg Message', argType: ARG_TYPE_STRING, expected: ['json', 'xml'], description: 'Specifies the type of the output' };
        const result = getArgHelpExpected(argDefinedWithExpected);
        const descriptionMatch = result.match(/Custom Arg Message/);
        expect(descriptionMatch).not.toBeNull();
        const expectedValuesMatch = result.match(/ -t=\{json|xml\}/);
        expect(expectedValuesMatch).toBeNull();
    });

    it('Value is valid if there are no expected values', () => {
        expect(isValueValid('json', [])).toBe(true);
    });
    it('check if 1 or more values are valid with expected values', () => {
        expect(isValueValid('json', ['json', 'xml'])).toBe(true);
        expect(isValueValid(['json'], ['json', 'xml'])).toBe(true);
        expect(isValueValid(['json', 'xml'], ['json', 'xml'])).toBe(true);
    });

    it('check if 1 or more values are invalid with expected values', () => {
        const argDefinedWithExpected: ArgDefined = { args: ['-t', '--type'], key: 'type', argType: ARG_TYPE_STRING, expected: ['json', 'xml'], description: 'Specifies the type of the output' };
        expect(isValueValid('yaml', argDefinedWithExpected.expected)).toBe(false);
        expect(isValueValid(['yaml'], argDefinedWithExpected.expected)).toBe(false);
        expect(isValueValid(['json', 'yaml'], argDefinedWithExpected.expected)).toBe(false);
    });

    it('validate value with no expected values', () => {
        const argDefinedNoExpected: ArgDefined = { args: ['-t', '--type'], key: 'type', argType: ARG_TYPE_STRING, description: 'Specifies the type of the output' };
        expect(expectedValidator('anyvalue', argDefinedNoExpected, {remaining: []})).toBe(true);
        expect(expectedValidator(['anyvalue'], argDefinedNoExpected, {remaining: []})).toBe(true);
        expect(expectedValidator(['anyvalue', 'anyvalue2'], argDefinedNoExpected, {remaining: []})).toBe(true);
    });

    it('validate empty value', () => {
        const argDefinedWithExpected: ArgDefined = { args: ['-t', '--type'], key: 'type', argType: ARG_TYPE_STRING, expected: ['json', 'xml'], description: 'Specifies the type of the output' };
        expect(expectedValidator('', argDefinedWithExpected, {remaining: []})).toBe(false);
    });

    it('validate if 1 or more values are valid with expected values', () => {
        const argDefinedWithExpected: ArgDefined = { args: ['-t', '--type'], key: 'type', argType: ARG_TYPE_STRING, expected: ['json', 'xml'], description: 'Specifies the type of the output' };
        expect(expectedValidator(['json', 'yaml'], argDefinedWithExpected, { remaining: []})).toBe(false);
        expect(expectedValidator(['json'], argDefinedWithExpected, { remaining: []})).toBe(true);
    });

        it('validate if 1 or more values are invalid with expected values', () => {
        const argDefinedWithExpected: ArgDefined = { args: ['-t', '--type'], key: 'type', argType: ARG_TYPE_STRING, expected: ['json', 'xml'], description: 'Specifies the type of the output' };
        expect(expectedValidator('yaml', argDefinedWithExpected, {remaining: []})).toBe(false);
        expect(expectedValidator(['yaml'], argDefinedWithExpected, {remaining: []})).toBe(false);
        expect(expectedValidator(['json', 'yaml'], argDefinedWithExpected, {remaining: []})).toBe(false);
    });
});