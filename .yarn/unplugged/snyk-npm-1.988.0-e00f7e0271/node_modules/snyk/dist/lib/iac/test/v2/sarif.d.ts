import * as sarif from 'sarif';
import { TestOutput } from './scan/results';
export declare function convertEngineToSarifResults(scanResult: TestOutput): sarif.Log;
