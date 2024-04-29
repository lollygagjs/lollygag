import {glob} from 'glob';
import {extname, join, resolve} from 'path';
import {existsSync, readFileSync} from 'fs';
import Handlebars from 'handlebars';

import Lollygag, {
    changeExtname,
    FileHandler,
    handlebars,
    IFile,
    RaggedyAny,
    Worker,
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

Handlebars.registerHelper('json', (context) =>
    JSON.stringify(context, null, 2));

Handlebars.registerHelper('log', (value) => {
    console.log(value);
});

Handlebars.registerHelper(
    'partial',
    function x(this: RaggedyAny, path, context, options) {
        let partial = Handlebars.partials[path];

        if(typeof partial !== 'function') {
            partial = Handlebars.compile(partial);
        }

        let ctx = {};

        if(typeof context !== 'object') {
            ctx = {value: context};
        } else if(context.hash && Object.keys(context.hash).length > 0) {
            ctx = context.hash;
        } else if(context.data && context.data.root) {
            ctx = context.data.root;
        } else {
            ctx = context;
        }

        if(context.fn) {
            ctx = {...ctx, body: context.fn(this)};
        } else if(options && options.fn) {
            ctx = {...ctx, body: options.fn(this)};
        }

        return new Handlebars.SafeString(partial(ctx));
    }
);

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
