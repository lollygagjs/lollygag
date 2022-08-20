import { TWorker } from '@lollygag/core';
import { ModuleKind, ScriptTarget } from 'typescript';
export interface ICompilerOptions {
    module?: keyof typeof ModuleKind;
    target?: keyof typeof ScriptTarget;
}
export interface ITypescriptOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compilerOptions?: ICompilerOptions;
}
export declare function typescript(options?: ITypescriptOptions): TWorker;
export default typescript;
