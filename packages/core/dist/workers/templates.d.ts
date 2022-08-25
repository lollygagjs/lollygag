import {FileHandler, Worker} from '..';
export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    defaultTemplate?: string;
    templatingHandler?:FileHandler;
    templatingHandlerOptions?: unknown;
}
export declare function templates(options?: ITemplatesOptions):Worker;
export default templates;
