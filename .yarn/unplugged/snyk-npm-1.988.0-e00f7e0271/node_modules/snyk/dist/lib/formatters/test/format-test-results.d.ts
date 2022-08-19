import { Options, OutputDataTypes, SupportedProjectTypes, TestOptions } from '../../types';
import { GroupedVuln, TestResult } from '../../snyk-test/legacy';
export declare function extractDataToSendFromResults(results: any, mappedResults: any, options: Options): OutputDataTypes;
export declare function createErrorMappedResultsForJsonOutput(results: any): any;
export declare function getDisplayedOutput(res: TestResult, options: Options & TestOptions, testedInfoText: string, localPackageTest: any, projectType: SupportedProjectTypes, meta: string, prefix: string, multiProjAdvice: string, dockerAdvice: string): string;
export declare function dockerUserCTA(options: any): "" | "\n\nFor more free scans that keep your images secure, sign up to Snyk at https://dockr.ly/3ePqVcp";
export declare function groupVulnerabilities(vulns: any): {
    [vulnId: string]: GroupedVuln;
};
