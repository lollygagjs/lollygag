import Handlebars from 'handlebars';
import { IConfig, IFile, FileHandler, Worker } from '..';
export { Handlebars };
export interface IHandlebarsOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}
export declare type TemplateData = IConfig & IFile;
export interface IHandleHandlebarsOptions {
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}
export declare const handleHandlebars: FileHandler;
export declare function handlebars(options?: IHandlebarsOptions): Worker;
export default handlebars;
