import Handlebars from 'handlebars';
import { IConfig, IFile, TFileHandler, TWorker } from '..';
export { Handlebars };
export interface IHandlebarsOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}
export declare type TTemplateData = IConfig & IFile;
export interface IHandleHandlebarsOptions {
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}
export declare const handleHandlebars: TFileHandler;
export declare function handlebars(options?: IHandlebarsOptions): TWorker;
export default handlebars;
