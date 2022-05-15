import { TFileHandler, TWorker } from '@lollygag/core';
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
