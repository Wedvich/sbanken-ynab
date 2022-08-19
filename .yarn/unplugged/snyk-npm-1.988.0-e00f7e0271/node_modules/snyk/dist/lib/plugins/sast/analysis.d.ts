import { Options } from '../../types';
import { SastSettings, Log } from './types';
export declare function getCodeAnalysisAndParseResults(root: string, options: Options, sastSettings: SastSettings, requestId: string): Promise<Log | null>;
