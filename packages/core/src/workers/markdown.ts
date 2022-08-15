/* eslint-disable no-continue */
import {extname} from 'path';
import md, {Options} from 'markdown-it';
import {changeExtname, handleHandlebars, TFileHandler, TWorker} from '..';

export interface IMarkdownOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    markdownOptions?: Options;
    templatingHandler?: TFileHandler;
    templatingHandlerOptions?: unknown;
}

export const handleMarkdown: TFileHandler = (
    content,
    options?,
    data?
): string => md((options as Options) ?? {}).render(content ?? '', data);

export function markdown(options?: IMarkdownOptions): TWorker {
    return function markdownWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        const {
            targetExtnames,
            newExtname,
            markdownOptions,
            templatingHandler,
            templatingHandlerOptions,
        } = options ?? {};

        const _targetExtnames = targetExtnames ?? ['.md', '.html'];
        const _newExtname = newExtname ?? '.html';

        const _markdownOptions = {
            html: true,
            ...markdownOptions,
        };

        const _templatingHandler
            = templatingHandler
            ?? lollygag._config.templatingHandler
            ?? handleHandlebars;

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!_targetExtnames.includes(extname(file.path))) {
                continue;
            }

            const data = {...lollygag._meta, ...lollygag._config, ...file};

            file.content = _templatingHandler(
                file.content ?? '',
                templatingHandlerOptions,
                data
            );

            file.content = handleMarkdown(
                file.content ?? '',
                _markdownOptions,
                data
            );

            if(_newExtname !== false) {
                file.path = changeExtname(file.path, _newExtname);
            }
        }
    };
}

export default markdown;
