import { Policy } from '../../../../../../lib/policy/find-and-load-policy';
import { IacOutputMeta, ProjectAttributes, Tag } from '../../../../../../lib/types';
import { FormattedResult, IacFileScanResult, IacOrgSettings, IaCTestFlags } from '../types';
export declare function processResults(resultsWithCustomSeverities: IacFileScanResult[], orgPublicId: string, iacOrgSettings: IacOrgSettings, policy: Policy | undefined, tags: Tag[] | undefined, attributes: ProjectAttributes | undefined, options: IaCTestFlags, projectRoot: string, meta: IacOutputMeta): Promise<{
    filteredIssues: FormattedResult[];
    ignoreCount: number;
}>;
