import {extname} from 'path';
import md, {Options} from 'markdown-it';

import {
    changeExtname,
    handleHandlebars,
    FileHandler,
    Worker,
} from '@lollygag/core';

export interface IMarkdownOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}

export const handleMarkdown: FileHandler = (content, options?, data?): string =>
    md((options as Options) ?? {}).render(content ?? '', data);

export function markdown(options?: IMarkdownOptions): Worker {
    return function markdownWorker(files, lollygag): void {
        if(!files) return;

        const {
            newExtname = '.html',
            targetExtnames = ['.md', '.html'],
            templatingHandler = lollygag._config.templatingHandler
                ?? handleHandlebars,
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

            const data = {...lollygag._meta, ...lollygag._config, ...file};

            file.content = templatingHandler(
                file.content ?? '',
                templatingHandlerOptions,
                data
            );

            file.content = handleMarkdown(
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

export default markdown;
