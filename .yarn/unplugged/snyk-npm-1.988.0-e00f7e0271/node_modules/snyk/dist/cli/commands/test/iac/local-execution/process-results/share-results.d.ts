import { Policy } from '../../../../../../lib/policy/find-and-load-policy';
import { IacOutputMeta, ProjectAttributes, Tag } from '../../../../../../lib/types';
import { IacFileScanResult, IaCTestFlags, ShareResultsOutput } from '../types';
export declare function formatAndShareResults({ results, options, orgPublicId, policy, tags, attributes, projectRoot, meta, }: {
    results: IacFileScanResult[];
    options: IaCTestFlags;
    orgPublicId: string;
    policy: Policy | undefined;
    tags?: Tag[];
    attributes?: ProjectAttributes;
    projectRoot: string;
    meta: IacOutputMeta;
}): Promise<ShareResultsOutput>;
