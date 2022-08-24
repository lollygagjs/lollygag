import { Options } from 'markdown-it';
import { TFileHandler, TWorker } from '@lollygag/core';
export interface IMarkdownOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
    templatingHandler?: TFileHandler;
    templatingHandlerOptions?: unknown;
}
export declare const handleMarkdown: TFileHandler;
export declare function markdown(options?: IMarkdownOptions): TWorker;
export default markdown;
