/* eslint-disable no-continue */
import {extname, join, resolve} from 'path';
import http from 'http';
import {log} from 'console';
import {watch as watcher} from 'chokidar';
import {green} from 'chalk';
import minimatch from 'minimatch';
import handler from 'serve-handler';
import livereload from 'livereload';
import {parse} from 'node-html-parser';
import Lollygag, {removeParentFromPath, Worker} from '@lollygag/core';

/**
 * Glob path of files to watch.
 */
export type ToWatch = string;

/**
 * Boolean or glob path of files to rebuild. Glob path is
 * relative to the `Lollygag` instance's `__in` directory. When
 * set to true, only the edited/added file will get rebuilt.
 */
export type ToRebuild = string | boolean;

export interface IWatchPatterns {
    [prop: string]: ToRebuild;
}

export interface IWatchOptions {
    serverPort?: number;
    livereloadHost?: string;
    livereloadPort?: number;
    injectLivereloadScript?: boolean;
    patterns: IWatchPatterns;
    fullBuild?: boolean;
}

interface IRebuildOptions {
    eventSuffix: string;
    triggeredPath: string;
    lollygag: Lollygag;
    watchOptions: IWatchOptions;
}

async function rebuild(options: IRebuildOptions): Promise<void> {
    const {triggeredPath, eventSuffix, lollygag, watchOptions} = options;

    const msg = `File \`${triggeredPath}\` ${eventSuffix}.\nRebuilding...`;
    const dashes = '----------------------------------------';

    log(green(`${dashes}\n${msg}\n${dashes}`));

    let globPattern = null;

    if(!watchOptions.fullBuild) {
        let toRebuild: ToRebuild = true;

        Object.keys(watchOptions.patterns).forEach((patternKey) => {
            if(minimatch(triggeredPath, patternKey)) {
                toRebuild = watchOptions.patterns[patternKey];
            }
        });

        let validTriggeredPath = '';

        if(minimatch(triggeredPath, join(lollygag._in, '**/*'))) {
            validTriggeredPath = removeParentFromPath(
                lollygag._in,
                triggeredPath
            );
        }

        if(typeof toRebuild === 'boolean') {
            globPattern = validTriggeredPath;
        } else {
            globPattern = toRebuild;
        }
    }

    await lollygag.build({
        fullBuild: watchOptions.fullBuild,
        globPattern,
    });
}

let serverStarted = false;

export function livedev(options: IWatchOptions): Worker {
    return async function livedevWorker(files, lollygag): Promise<void> {
        const serverPort = options.serverPort ?? 3000;
        const livereloadHost = options.livereloadHost ?? '0.0.0.0';
        const livereloadPort = options.livereloadPort ?? 35729;

        if(options.injectLivereloadScript) {
            for(let i = 0; i < files.length; i++) {
                const file = files[i];

                if(extname(file.path) !== '.html') continue;

                const doc = parse(file.content ?? '');
                const body = doc.querySelector('body');

                if(!body) continue;

                const script = parse(
                    `<script src='http://${livereloadHost}:${livereloadPort}/livereload.js'></script>`
                );

                body.appendChild(script);

                file.content = doc.toString();
            }
        }

        if(serverStarted) return;

        serverStarted = true;

        const staticDir = resolve(lollygag._out);

        const server = http.createServer((req, res) =>
            handler(req, res, {
                public: staticDir,
                cleanUrls: true,
            }));

        await new Promise((ok) => {
            server.listen(serverPort, () => {
                log(green(`Server running at port ${serverPort}`));

                ok(null);
            });
        });

        await new Promise((ok) => {
            livereload
                .createServer({port: livereloadPort}, () => {
                    log(
                        green(
                            `Livereload server running at port ${livereloadPort}`
                        )
                    );

                    ok(null);
                })
                .watch([staticDir, resolve('.timestamp')]);
        });

        const toWatch: ToWatch[] = [];

        Object.keys(options.patterns).forEach((pattern) => {
            toWatch.push(pattern);
        });

        const watched = watcher(toWatch, {ignoreInitial: true});

        async function onAddOrChange(path: string) {
            watched.off('add', onAddOrChange);
            watched.off('change', onAddOrChange);

            await rebuild({
                eventSuffix: 'changed',
                triggeredPath: path,
                watchOptions: options,
                lollygag,
            });

            watched.on('add', onAddOrChange);
            watched.on('change', onAddOrChange);
        }

        watched.on('add', onAddOrChange);
        watched.on('change', onAddOrChange);
    };
}

export default livedev;
