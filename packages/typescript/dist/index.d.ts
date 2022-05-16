import { TWorker } from '@lollygag/core';
import { CompilerOptions } from 'typescript';
export interface ITypescriptOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compilerOptions?: CompilerOptions;
}
export declare function typescript(options?: ITypescriptOptions): TWorker;
export default typescript;
