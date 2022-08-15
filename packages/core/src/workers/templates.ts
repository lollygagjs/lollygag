/* eslint-disable no-continue */
import {extname, join, resolve} from 'path';
import {existsSync, readFileSync} from 'fs';
import {changeExtname, handleHandlebars, TFileHandler, TWorker} from '..';

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

        const {
            newExtname,
            targetExtnames,
            templatesDirectory,
            defaultTemplate,
            templatingHandler,
            templatingHandlerOptions,
        } = options ?? {};

        const _newExtname = newExtname ?? '.html';
        const _targetExtnames = targetExtnames ?? ['.hbs', '.html'];
        const _templatesDirectory = templatesDirectory ?? 'templates';
        const _defaultTemplate = defaultTemplate ?? 'index.hbs';

        const _templatingHandler
            = templatingHandler
            ?? lollygag._config.templatingHandler
            ?? handleHandlebars;

        let template = '';
        let templatePath = join(_templatesDirectory, _defaultTemplate);

        if(existsSync(templatePath)) {
            template = readFileSync(templatePath, {encoding: 'utf-8'});
        } else {
            // get built-in template
            template = readFileSync(resolve(__dirname, 'templates/index.hbs'), {
                encoding: 'utf-8',
            });

            console.log(
                `NOTICE: File '${templatePath}' not found. Using built-in template as default.`
            );
        }

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!_targetExtnames.includes(extname(file.path))) {
                continue;
            }

            console.log(`Processing '${file.path}'...`);

            if(file.template && file.template !== _defaultTemplate) {
                templatePath = join(_templatesDirectory, file.template);

                if(existsSync(templatePath)) {
                    template = readFileSync(templatePath, {encoding: 'utf-8'});
                } else {
                    console.log(
                        `NOTICE: File '${templatePath}' missing. Using default template.`
                    );
                }
            }

            const data = {...lollygag._meta, ...lollygag._config, ...file};

            file.content = _templatingHandler(
                template,
                templatingHandlerOptions,
                data
            );

            console.log(`Processing '${file.path}'... done!`);

            if(_newExtname !== false) {
                file.path = changeExtname(file.path, _newExtname);
            }
        }
    };
}

export default templates;
