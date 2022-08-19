import { Policy } from '../../../../../../lib/policy/find-and-load-policy';
import { IacOutputMeta, ProjectAttributes, Tag } from '../../../../../../lib/types';
import { FormattedResult, IacFileScanResult, IacOrgSettings, IaCTestFlags } from '../types';
export interface ResultsProcessor {
    processResults(resultsWithCustomSeverities: IacFileScanResult[], policy: Policy | undefined, tags: Tag[] | undefined, attributes: ProjectAttributes | undefined): Promise<{
        filteredIssues: FormattedResult[];
        ignoreCount: number;
    }>;
}
export declare class SingleGroupResultsProcessor implements ResultsProcessor {
    private projectRoot;
    private orgPublicId;
    private iacOrgSettings;
    private options;
    private meta;
    constructor(projectRoot: string, orgPublicId: string, iacOrgSettings: IacOrgSettings, options: IaCTestFlags, meta: IacOutputMeta);
    processResults(resultsWithCustomSeverities: IacFileScanResult[], policy: Policy | undefined, tags: Tag[] | undefined, attributes: ProjectAttributes | undefined): Promise<{
        filteredIssues: FormattedResult[];
        ignoreCount: number;
    }>;
}
