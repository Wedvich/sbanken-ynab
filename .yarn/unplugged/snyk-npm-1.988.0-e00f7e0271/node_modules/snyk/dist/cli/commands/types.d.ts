export declare type MethodResult = CommandResult | string | void;
export declare class CommandResult {
    result: string;
    constructor(result: string);
    toString(): string;
    getDisplayResults(): string;
}
export declare abstract class TestCommandResult extends CommandResult {
    protected jsonResult: string;
    protected sarifResult: string;
    getJsonResult(): string;
    getSarifResult(): string;
    static createHumanReadableTestCommandResult(humanReadableResult: string, jsonResult: string, sarifResult?: string): HumanReadableTestCommandResult;
    static createJsonTestCommandResult(stdout: string, jsonResult?: string, sarifResult?: string): JsonTestCommandResult;
}
declare class HumanReadableTestCommandResult extends TestCommandResult {
    protected jsonResult: string;
    protected sarifResult: string;
    constructor(humanReadableResult: string, jsonResult: string, sarifResult?: string);
    getJsonResult(): string;
    getSarifResult(): string;
}
declare class JsonTestCommandResult extends TestCommandResult {
    constructor(stdout: string, jsonResult?: string, sarifResult?: string);
    getJsonResult(): string;
    getSarifResult(): string;
}
export interface IgnoreMetadata {
    reason: string;
    expires: Date;
    created: Date;
}
export interface IgnoreRulePathData {
    [path: string]: IgnoreMetadata;
}
export interface IgnoreRules {
    [issueId: string]: IgnoreRulePathData[];
}
export {};
