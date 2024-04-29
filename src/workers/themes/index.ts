import {glob} from 'glob';
import {extname, join, resolve} from 'path';
import {existsSync, readFileSync} from 'fs';
import Handlebars from 'handlebars';

import Lollygag, {
    changeExtname,
    handlebars,
    FileHandler,
    Worker,
    IFile,
} from '../..';

export interface IThemesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    themesDirectory?: string;
    partialsDirectory?: string;
    defaultTheme?: string;
    templatingHandler?: FileHandler;
    templatingHandlerOptions?: unknown;
}

// renders a registered partial
Handlebars.registerHelper('partial', (path, context) => {
    let partial = Handlebars.partials[path];

    if(typeof partial !== 'function') partial = Handlebars.compile(partial);

    return new Handlebars.SafeString(partial(context));
});

export const registerPartials = (dir: string) => {
    glob.sync(`${dir}/*.hbs`).forEach((file) => {
        const name = (file.split('/').pop() ?? file).split('.')[0];
        const partial = readFileSync(file, 'utf8');

        Handlebars.registerPartial(name, partial);
    });
};

export function worker(options?: IThemesOptions): Worker {
    return function themesWorker(files: IFile[], lollygag: Lollygag): void {
        if(!files) return;

        const {
            newExtname = '.html',
            targetExtnames = ['.hbs', '.html'],
            themesDirectory = 'themes',
            partialsDirectory = join(themesDirectory, 'partials'),
            defaultTheme = 'index.hbs',
            templatingHandler = lollygag._config.templatingHandler
                ?? handlebars.handler,
            templatingHandlerOptions,
        } = options ?? {};

        let theme = '';
        let themePath = join(themesDirectory, defaultTheme);

        if(existsSync(themePath)) {
            theme = readFileSync(themePath, {encoding: 'utf-8'});
        } else {
            // get built-in theme
            theme = readFileSync(resolve(__dirname, '../themes/index.hbs'), {
                encoding: 'utf-8',
            });

            console.warn(
                `NOTICE: File '${themePath}' not found. Using built-in theme as default.`
            );
        }

        registerPartials(partialsDirectory);

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(file.theme && file.theme !== defaultTheme) {
                themePath = join(themesDirectory, file.theme);

                if(existsSync(themePath)) {
                    theme = readFileSync(themePath, {encoding: 'utf-8'});
                } else {
                    console.warn(
                        `NOTICE: File '${themePath}' missing. Using default theme.`
                    );
                }
            }

            file.content = templatingHandler(theme, templatingHandlerOptions, {
                ...lollygag._sitemeta,
                ...lollygag._config,
                ...file,
            });

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }
        }
    };
}

export default worker;
