import {Options} from 'markdown-it';
import {FileHandler, Worker} from '..';
export interface IMarkdownOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
    templatingHandler?:FileHandler;
    templatingHandlerOptions?: unknown;
}
export declare const handleMarkdown:FileHandler;
export declare function markdown(options?: IMarkdownOptions):Worker;
export default markdown;
