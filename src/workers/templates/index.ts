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

export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    partialsDirectory?: string;
    defaultTemplate?: string;
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

export function worker(options?: ITemplatesOptions): Worker {
    return function templatesWorker(files: IFile[], lollygag: Lollygag): void {
        if(!files) return;

        const {
            newExtname = '.html',
            targetExtnames = ['.hbs', '.html'],
            templatesDirectory = 'templates',
            partialsDirectory = join(templatesDirectory, 'partials'),
            defaultTemplate = 'index.hbs',
            templatingHandler = lollygag._config.templatingHandler
                ?? handlebars.handler,
            templatingHandlerOptions,
        } = options ?? {};

        let template = '';
        let templatePath = join(templatesDirectory, defaultTemplate);

        if(existsSync(templatePath)) {
            template = readFileSync(templatePath, {encoding: 'utf-8'});
        } else {
            // get built-in template
            template = readFileSync(
                resolve(__dirname, '../templates/index.hbs'),
                {encoding: 'utf-8'}
            );

            console.warn(
                `NOTICE: File '${templatePath}' not found. Using built-in template as default.`
            );
        }

        registerPartials(partialsDirectory);

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(file.template && file.template !== defaultTemplate) {
                templatePath = join(templatesDirectory, file.template);

                if(existsSync(templatePath)) {
                    template = readFileSync(templatePath, {encoding: 'utf-8'});
                } else {
                    console.warn(
                        `NOTICE: File '${templatePath}' missing. Using default template.`
                    );
                }
            }

            file.content = templatingHandler(
                template,
                templatingHandlerOptions,
                {...lollygag._sitemeta, ...lollygag._config, ...file}
            );

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }
        }
    };
}

export default worker;
