import { FormattedResult, PerformanceAnalyticsKey, RulesOrigin } from './types';
import { DescribeOptions, DriftAnalysis } from '../../../../../lib/iac/types';
export declare function addIacAnalytics(formattedResults: FormattedResult[], opts: {
    ignoredIssuesCount: number;
    rulesOrigin: RulesOrigin;
}): void;
export declare const performanceAnalyticsObject: Record<PerformanceAnalyticsKey, number | null>;
export declare function addIacDriftAnalytics(analysis: DriftAnalysis, options: DescribeOptions): void;
