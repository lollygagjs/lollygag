/* eslint-disable no-continue */
import {extname} from 'path';
import {readFileSync} from 'fs';
import glob from 'glob';
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

// Renders a registered partial
Handlebars.registerHelper('partial', (path, context) => {
    let partial = Handlebars.partials[path];

    if(typeof partial !== 'function') partial = Handlebars.compile(partial);

    return new Handlebars.SafeString(partial(context));
});

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

export const registerPartials = (dir: string) => {
    glob.sync(`${dir}/*.hbs`).forEach((file) => {
        const name = (file.split('/').pop() ?? file).split('.')[0];
        const partial = readFileSync(file, 'utf8');

        Handlebars.registerPartial(name, partial);
    });
};

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

        const {
            newExtname = '.html',
            targetExtnames = ['.hbs', '.html'],
            compileOptions,
            runtimeOptions,
        } = options ?? {};

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            file.content = handleHandlebars(
                file.content ?? '',
                {compileOptions, runtimeOptions},
                {...lollygag._meta, ...lollygag._config, ...file}
            );

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }
        }
    };
}

export default handlebars;
