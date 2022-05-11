"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const core_1 = require("@lollygag/core");
const handlebars_1 = require("@lollygag/handlebars");
const fs_1 = require("fs");
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
function templates(options) {
    return function templatesWorker(files, lollygag) {
        if (!files)
            return;
        const handler = (options === null || options === void 0 ? void 0 : options.handler) || handlebars_1.handleHandlebars;
        const templatesDirectory = (options === null || options === void 0 ? void 0 : options.templatesDirectory) || 'templates';
        const defaultTemplate = (options === null || options === void 0 ? void 0 : options.defaultTemplate) || 'index.hbs';
        let templatePath = (0, path_1.join)(templatesDirectory, defaultTemplate);
        if ((0, fs_1.existsSync)(templatePath)) {
            template = (0, fs_1.readFileSync)(templatePath, { encoding: 'utf-8' });
        }
        else {
            console.log(`NOTICE: File '${templatePath}' not found. Using built-in template as default.`);
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const targetExtnames = [
                ...['.hbs', '.html'],
                ...((options === null || options === void 0 ? void 0 : options.targetExtnames) || []),
            ];
            if (!targetExtnames.includes((0, path_1.extname)(file.path))) {
                continue;
            }
            console.log(`Processing '${file.path}'...`);
            if ((options === null || options === void 0 ? void 0 : options.newExtname) !== false) {
                file.path = (0, core_1.changeExtname)(file.path, (options === null || options === void 0 ? void 0 : options.newExtname) || '.html');
            }
            if (file.template && file.template !== defaultTemplate) {
                templatePath = (0, path_1.join)(templatesDirectory, file.template);
                if ((0, fs_1.existsSync)(templatePath)) {
                    template = (0, fs_1.readFileSync)(templatePath, { encoding: 'utf-8' });
                }
                else {
                    console.log(`NOTICE: File '${templatePath}' missing. Using default template.`);
                }
            }
            const data = Object.assign(Object.assign({}, lollygag._config), file);
            file.content = handler(template, options === null || options === void 0 ? void 0 : options.handlerOptions, data);
            console.log(`Processing '${file.path}'... Done!`);
        }
    };
}
exports.templates = templates;
exports.default = templates;
