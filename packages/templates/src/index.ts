/* eslint-disable no-continue */
import {extname, join} from 'path';
import {changeExtname, TFileHandler, TWorker} from '@lollygag/core';
import {handleHandlebars} from '@lollygag/handlebars';
import {existsSync, readFileSync} from 'fs';

export interface ITemplatesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    templatesDirectory?: string;
    defaultTemplate?: string;
    handler?: TFileHandler;
    handlerOptions?: unknown;
}

let template = `<html lang="en">
<head>
  <meta charset="UTF-8" />
  {{#if description}}
    <meta name="description" content="{{description}}" />
  {{/if}}
  <meta name="viewport" content="device-width, initial-scale=1.0" />
  <meta name="generator" content="{{orDefault generator 'Lollygag'}}" />
  <title>{{orDefault sitename "Lollygag"}}{{#if title}}
      &mdash;
      {{title}}{{/if}}</title>
</head>
<body>
  <div id="container">
    <header>
      <div class="branding">
        <a href="{{subdir}}/">{{orDefault sitename "Lollygag"}}</a>
      </div>
    </header>
    <main>
      <article>
        {{#if title}}<h1 class="title">{{title}}</h1>{{/if}}
        {{#if content}}
          <div class="content">{{{content}}}</div>
        {{/if}}
      </article>
    </main>
    <footer>
      <p class="copyright-notice">&copy;
        {{year}}
        <a href="{{subdir}}/">{{orDefault sitename "Lollygag"}}</a>. All
        rights reserved</p>
    </footer>
  </div>
</body>
</html>`;

export function templates(options?: ITemplatesOptions): TWorker {
    return function templatesWorker(this: TWorker, files, lollygag): void {
        if(!files) return;

        const handler = options?.handler || handleHandlebars;

        const templatesDirectory = options?.templatesDirectory || 'templates';
        const defaultTemplate = options?.defaultTemplate || 'index.hbs';

        let templatePath = join(templatesDirectory, defaultTemplate);

        if(existsSync(templatePath)) {
            template = readFileSync(templatePath, {encoding: 'utf-8'});
        } else {
            console.log(
                `File '${templatePath}' not found. Using built-in template as default.`
            );
        }

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = [
                ...['.hbs', '.html'],
                ...(options?.targetExtnames || []),
            ];

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
                        `File '${templatePath}' missing. Using default template.`
                    );
                }
            }

            const data = {...lollygag._config, ...file};

            file.content = handler(template, options?.handlerOptions, data);

            console.log(`Processing '${file.path}'... Done!`);
        }
    };
}

export default templates;
