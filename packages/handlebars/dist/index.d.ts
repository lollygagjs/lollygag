import Handlebars from 'handlebars';
import { IConfig, IFile, TFileHandler, TWorker } from '@lollygag/core';
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
    compileOptions?: CompileOptions;
}
export declare const handleHandlebars: TFileHandler;
export default function handlebars(options?: IHandlebarsOptions): TWorker;
