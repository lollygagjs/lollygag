/* eslint-disable no-continue */
import {extname} from 'path';
import Handlebars from 'handlebars';
import {changeExtname, IConfig, IFile, TWorker} from '@lollygag/core';

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
    compilerOptions?: CompileOptions;
}

export function processHandlebars(
    content: string,
    options?: IProcessHandlebarsOptions,
    data?: TTemplateData
): string {
    return Handlebars.compile(content, options?.compilerOptions)(
        data,
        options?.runtimeOptions
    );
}

export function handlebars(options?: IHandlebarsOptions): TWorker {
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

            file.content = processHandlebars(file.content || '', options, data);
        }
    };
}

export default handlebars;
