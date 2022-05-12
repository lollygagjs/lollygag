import Lollygag from '@lollygag/core';
import markdown from '@lollygag/markdown';
import templates from '@lollygag/templates';
import livedev from '@lollygag/livedev';

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
        })
    )
    .build({fullBuild: true});
