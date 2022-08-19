import { IacFileScanResult, IacShareResultsFormat } from '../types';
import { IacOutputMeta } from '../../../../../../lib/types';
export declare function formatShareResults(projectRoot: string, scanResults: IacFileScanResult[], meta: IacOutputMeta): IacShareResultsFormat[];
