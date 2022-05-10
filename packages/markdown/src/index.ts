/* eslint-disable no-continue */
import {extname} from 'path';
import md, {Options} from 'markdown-it';
import {changeExtname, IConfig, IFile, TWorker} from '@lollygag/core';

export interface IMarkdownOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
}

export type TTemplateData = IConfig & IFile;

export function processMarkdown(
    content: string,
    options?: Options,
    data?: TTemplateData
): string {
    return md(options || {}).render(content || '', data);
}

export default function markdown(options?: IMarkdownOptions): TWorker {
    return function markdownWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = [
                ...['.md', '.html'],
                ...(options?.targetExtnames || []),
            ];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(options?.newExtname !== false) {
                file.path = changeExtname(
                    file.path,
                    options?.newExtname || '.html'
                );
            }

            const data = {...lollygag._config, ...file};

            const mdOptions = {
                html: true,
                ...options?.markdownOptions,
            };

            file.content = processMarkdown(file.content || '', mdOptions, data);
        }
    };
}
