import { FileHandler, Worker } from '@lollygag/core';
export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    partialsDirectory?: string;
    defaultTemplate?: string;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}
export declare const registerPartials: (dir: string) => void;
export declare function templates(options?: ITemplatesOptions): Worker;
export default templates;
