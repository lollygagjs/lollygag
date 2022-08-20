/* eslint-disable no-continue */
import {extname} from 'path';
import Handlebars from 'handlebars';

import {changeExtname, IConfig, IFile, TFileHandler, TWorker} from '..';

// Return content as is
Handlebars.registerHelper('raw', (any) => any.fn());
Handlebars.registerHelper('asIs', (any) => any.fn());

// Uppercase string
Handlebars.registerHelper('uc', (str: string) => str.toUpperCase());

// Lowercase string
Handlebars.registerHelper('lc', (str: string) => str.toLowerCase());

// Capitalize first word of a string
Handlebars.registerHelper(
    'cap',
    (word: string) => word.charAt(0).toUpperCase() + word.substring(1)
);

// Capitalize all words in a string
Handlebars.registerHelper('capWords', (words: string[]) =>
    words.map((word) => word.charAt(0).toUpperCase() + word.substring(1)));

// Return prop if it `exists`, `defaultValue` otherwise
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
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}

export const handleHandlebars: TFileHandler = (
    content,
    options?,
    data?
): string => {
    const {compileOptions, runtimeOptions}
        = (options as IHandleHandlebarsOptions | undefined) ?? {};

    return Handlebars.compile(content, compileOptions)(data, runtimeOptions);
};

export function handlebars(options?: IHandlebarsOptions): TWorker {
    return function handlebarsWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        const {compileOptions, runtimeOptions} = options ?? {};

        const newExtname = options?.newExtname ?? '.html';
        const targetExtnames = options?.targetExtnames ?? ['.hbs', '.html'];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            const data = {...lollygag._meta, ...lollygag._config, ...file};

            file.content = handleHandlebars(
                file.content ?? '',
                {compileOptions, runtimeOptions},
                data
            );

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }
        }
    };
}

export default handlebars;
