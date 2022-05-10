import Handlebars from 'handlebars';
import { IConfig, IFile, TWorker } from '@lollygag/core';
export { Handlebars };
export interface IHandlebarsOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}
export declare type TTemplateData = IConfig & IFile;
export interface IProcessHandlebarsOptions {
    runtimeOptions?: RuntimeOptions;
    compilerOptions?: CompileOptions;
}
export declare function processHandlebars(content: string, options?: IProcessHandlebarsOptions, data?: TTemplateData): string;
export declare function handlebars(options?: IHandlebarsOptions): TWorker;
export default handlebars;
