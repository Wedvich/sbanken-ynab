import { FormattedResult } from '../../../../cli/commands/test/iac/local-execution/types';
import { Results } from '../../../iac/test/v2/scan/results';
import { IacOutputMeta } from '../../../types';
import { IacTestData } from './types';
interface FormatTestDataParams {
    oldFormattedResults: FormattedResult[];
    iacOutputMeta: IacOutputMeta | undefined;
    ignoresCount: number;
}
export declare function formatTestData({ oldFormattedResults, iacOutputMeta: iacTestMeta, ignoresCount, }: FormatTestDataParams): IacTestData;
export declare function formatSnykIacTestTestData(snykIacTestScanResult: Results | undefined, projectName: string, orgName: string): IacTestData;
export {};
