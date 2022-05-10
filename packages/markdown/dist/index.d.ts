import { Options } from 'markdown-it';
import { IConfig, IFile, TWorker } from '@lollygag/core';
export interface IMarkdownOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
}
export declare type TTemplateData = IConfig & IFile;
export declare function processMarkdown(content: string, options?: Options, data?: TTemplateData): string;
export default function markdown(options?: IMarkdownOptions): TWorker;
