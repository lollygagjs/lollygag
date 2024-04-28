import {extname} from 'path';
import md, {Options} from 'markdown-it';

import {changeExtname, handlebars, FileHandler, Worker} from '../..';

export interface IMarkdownWorkerOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}

export const handler: FileHandler = (content, options?, data?): string =>
    md(options ?? {}).render(content ?? '', data);

export function worker(options?: IMarkdownWorkerOptions): Worker {
    return function markdownWorker(files, lollygag): void {
        if(!files) return;

        const {
            newExtname = '.html',
            targetExtnames = ['.md', '.html'],
            templatingHandler = lollygag._config.templatingHandler
                ?? handlebars.handler,
            markdownOptions,
            templatingHandlerOptions,
        } = options ?? {};

        const mergedMarkdownOptions = {
            html: true,
            ...markdownOptions,
        };

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            const data = {...lollygag._sitemeta, ...lollygag._config, ...file};

            file.content = templatingHandler(
                file.content ?? '',
                templatingHandlerOptions,
                data
            );

            file.content = handler(
                file.content ?? '',
                mergedMarkdownOptions,
                data
            );

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }
        }
    };
}

export default worker;
