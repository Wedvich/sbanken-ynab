/**
 *
 * @param {String} input of space separated URL/URI passed by
 * user for redirect URIs
 * @returns { String | Boolean } complying with enquirer return values, the function
 * separates the string on space and validates each to see
 * if a valid URL/URI. Return a string if invalid and
 * boolean true if valid
 */
export declare function validateAllURL(input: string): string | boolean;
/**
 * Custom validation logic which takes in consideration
 * creation of Snyk Apps and thus allows localhost.com
 * as a valid URL.
 * @param {String} input of URI/URL value to validate using
 * regex
 * @returns {String | Boolean } string message is not valid
 * and boolean true if valid
 */
export declare function validURL(input: string): boolean | string;
/**
 * Function validates if a valid UUID (version of UUID not tacken into account)
 * @param {String} input UUID to be validated
 * @returns {String | Boolean } string message is not valid
 * and boolean true if valid
 */
export declare function validateUUID(input: string): boolean | string;
/**
 * @param {String} input
 * @returns {String | Boolean } string message is not valid
 * and boolean true if valid
 */
export declare function validInput(input: string): string | boolean;
