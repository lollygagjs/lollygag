const {default: Lollygag} = require('@lollygag/core');
const {default: markdown} = require('@lollygag/markdown');
const {default: templates} = require('@lollygag/templates');
const {default: livedev} = require('@lollygag/livedev');

new Lollygag()
    .config({
        permalinks: true,
        siteName: '{{siteName}}',
    })
    .do(markdown())
    .do(templates())
    .do(
        livedev({
            patterns: {
                'files/**/*': true,
                'templates/**/*': '**/*.md',
            },
            injectLivereloadScript: true,
        })
    )
    .build({fullBuild: true});
