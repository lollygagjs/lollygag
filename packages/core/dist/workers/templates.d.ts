import { TFileHandler, TWorker } from '..';
export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    defaultTemplate?: string;
    templatingHandler?: TFileHandler;
    templatingHandlerOptions?: unknown;
}
export declare function templates(options?: ITemplatesOptions): TWorker;
export default templates;
