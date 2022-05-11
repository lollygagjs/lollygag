/* eslint-disable no-continue */
import {extname} from 'path';
import Handlebars from 'handlebars';

import {
    changeExtname,
    IConfig,
    IFile,
    TFileHandler,
    TWorker,
} from '@lollygag/core';

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

export interface IProcessHandlebarsOptions {
    runtimeOptions?: RuntimeOptions;
    compileOptions?: CompileOptions;
}

export const handleHandlebars: TFileHandler = (
    content,
    options?,
    data?
): string => {
    const o = options as IProcessHandlebarsOptions | undefined;

    return Handlebars.compile(content, o?.compileOptions)(
        data,
        o?.runtimeOptions
    );
};

export default function handlebars(options?: IHandlebarsOptions): TWorker {
    return function handlebarsWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = [
                ...['.hbs', '.html'],
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

            file.content = handleHandlebars(file.content || '', options, data);
        }
    };
}
