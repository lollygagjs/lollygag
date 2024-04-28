import { ModuleKind, ScriptTarget } from 'typescript';
import { Worker } from '../..';
export interface ICompilerOptions {
    module?: keyof typeof ModuleKind;
    target?: keyof typeof ScriptTarget;
}
export interface ITypescriptOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compilerOptions?: ICompilerOptions;
}
export declare function worker(options?: ITypescriptOptions): Worker;
export default worker;
