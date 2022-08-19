import { MethodArgs } from '../../args';
import { TestCommandResult } from '../../commands/types';
export default function test(...args: MethodArgs): Promise<TestCommandResult>;
