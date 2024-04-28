import { IConfig, IFile, FileHandler, Worker } from '../..';
export interface IHandlebarsOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}
export type TemplateData = IConfig & IFile;
export interface IHandleHandlebarsOptions {
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}
export declare const handler: FileHandler;
export declare function worker(options?: IHandlebarsOptions): Worker;
export default worker;
