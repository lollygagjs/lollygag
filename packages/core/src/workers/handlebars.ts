/* eslint-disable no-continue */
import {extname} from 'path';
import Handlebars from 'handlebars';

import {changeExtname, IConfig, IFile, TFileHandler, TWorker} from '..';

Handlebars.registerHelper('raw', (opts) => opts.fn());

Handlebars.registerHelper('asIs', (opts) => opts.fn());

Handlebars.registerHelper('orDefault', (prop, defaultValue) =>
    (prop ? prop : defaultValue));

export {Handlebars};

export interface IHandlebarsOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}

export type TTemplateData = IConfig & IFile;

export interface IHandleHandlebarsOptions {
    runtimeOptions?: RuntimeOptions;
    compileOptions?: CompileOptions;
}

export const handleHandlebars: TFileHandler = (
    content,
    options?,
    data?
): string => {
    const o = options as IHandleHandlebarsOptions | undefined;

    return Handlebars.compile(content, o?.compileOptions)(
        data,
        o?.runtimeOptions
    );
};

export function handlebars(options?: IHandlebarsOptions): TWorker {
    return function handlebarsWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = options?.targetExtnames || ['.hbs', '.html'];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(options?.newExtname !== false) {
                file.path = changeExtname(
                    file.path,
                    options?.newExtname || '.html'
                );
            }

            const data = {...lollygag._meta, ...lollygag._config, ...file};

            file.content = handleHandlebars(file.content || '', options, data);
        }
    };
}

export default handlebars;
