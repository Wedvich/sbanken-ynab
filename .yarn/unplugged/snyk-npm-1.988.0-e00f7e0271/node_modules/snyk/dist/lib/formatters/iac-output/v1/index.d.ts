import { IacTestResponse, AnnotatedIacIssue } from '../../../../lib/snyk-test/iac-test-result';
import * as sarif from 'sarif';
import { IacFileInDirectory, IacOutputMeta } from '../../../../lib/types';
export declare function getIacDisplayedOutput(iacTest: IacTestResponse, testedInfoText: string, meta: string, prefix: string): string;
export declare function getIacDisplayErrorFileOutput(iacFileResult: IacFileInDirectory): string;
export declare function capitalizePackageManager(type: string | undefined): "Kubernetes" | "Helm" | "Terraform" | "CloudFormation" | "ARM" | "Infrastructure as Code";
declare type ResponseIssues = {
    issue: AnnotatedIacIssue;
    targetPath: string;
}[];
export declare function createSarifOutputForIac(iacTestResponses: IacTestResponse[]): sarif.Log;
export declare function extractReportingDescriptor(results: ResponseIssues): sarif.ReportingDescriptor[];
export declare function mapIacTestResponseToSarifResults(issues: ResponseIssues): sarif.Result[];
export declare function shareResultsOutput(iacOutputMeta: IacOutputMeta): string;
export {};
