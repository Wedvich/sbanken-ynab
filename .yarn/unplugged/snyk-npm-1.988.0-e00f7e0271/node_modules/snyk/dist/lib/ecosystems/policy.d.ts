import { Options, PolicyOptions } from '../types';
import { Issue, IssuesData, ScanResult } from './types';
import { Policy } from '../policy/find-and-load-policy';
export declare function findAndLoadPolicyForScanResult(scanResult: ScanResult, options: Options & PolicyOptions): Promise<object | undefined>;
export declare function filterIgnoredIssues(issues: Issue[], issuesData: IssuesData, policy?: Policy): [Issue[], IssuesData];
