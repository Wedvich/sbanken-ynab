/**
 * Ensures a given function does not throw any errors, including unexpected ones
 * outside of its chain of execution.
 *
 * This function can only be used once in the same process. If you have multiple
 * callables needing this, compose them into a single callable.
 */
export declare function callHandlingUnexpectedErrors(callable: () => Promise<unknown>, exitCode: number): Promise<void>;
