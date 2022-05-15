/* eslint-disable no-continue */
import {extname, join, resolve} from 'path';
import {changeExtname, TFileHandler, TWorker} from '@lollygag/core';
import {handleHandlebars} from '@lollygag/handlebars';
import {existsSync, readFileSync} from 'fs';

export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    defaultTemplate?: string;
    templatingHandler?: TFileHandler;
    templatingHandlerOptions?: unknown;
}

export function templates(options?: ITemplatesOptions): TWorker {
    return function templatesWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        const templatingHandler
            = options?.templatingHandler || handleHandlebars;

        const templatesDirectory = options?.templatesDirectory || 'templates';
        const defaultTemplate = options?.defaultTemplate || 'index.hbs';

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

            console.log(
                `NOTICE: File '${templatePath}' not found. Using built-in template as default.`
            );
        }

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = options?.targetExtnames || ['.hbs', '.html'];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            console.log(`Processing '${file.path}'...`);

            if(options?.newExtname !== false) {
                file.path = changeExtname(
                    file.path,
                    options?.newExtname || '.html'
                );
            }

            if(file.template && file.template !== defaultTemplate) {
                templatePath = join(templatesDirectory, file.template);

                if(existsSync(templatePath)) {
                    template = readFileSync(templatePath, {encoding: 'utf-8'});
                } else {
                    console.log(
                        `NOTICE: File '${templatePath}' missing. Using default template.`
                    );
                }
            }

            const data = {...lollygag._meta, ...lollygag._config, ...file};

            file.content = templatingHandler(
                template,
                options?.templatingHandlerOptions,
                data
            );

            console.log(`Processing '${file.path}'... Done!`);
        }
    };
}

export default templates;
