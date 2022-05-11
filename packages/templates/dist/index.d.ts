import { TFileHandler, TWorker } from '@lollygag/core';
export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    defaultTemplate?: string;
    handler?: TFileHandler;
    handlerOptions?: unknown;
}
export declare function templates(options?: ITemplatesOptions): TWorker;
export default templates;
