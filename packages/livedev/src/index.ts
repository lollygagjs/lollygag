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
import Lollygag, {addParentToPath, TWorker} from '@lollygag/core';

/**
 * Glob path of files to watch.
 */
export type TToWatch = string;

/**
 * Boolean or glob path of files to rebuild. Glob path is
 * relative to the `Lollygag` instance's `__in` directory. When
 * set to true, only the edited/added file will get rebuilt.
 */
export type TToRebuild = string | boolean;

export interface IWatchPatterns {
    [prop: string]: TToRebuild;
}

export interface IWatchOptions {
    serverPort?: number;
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

    let globPattern = '';

    if(!watchOptions.fullBuild) {
        let toRebuild: TToRebuild = true;

        Object.keys(watchOptions.patterns).forEach((pattern) => {
            if(minimatch(triggeredPath, pattern)) {
                toRebuild = watchOptions.patterns[pattern];
            }
        });

        let validTriggeredPath = '';

        if(minimatch(triggeredPath, join(lollygag._in, '**/*'))) {
            validTriggeredPath = triggeredPath;
        }

        if(typeof toRebuild === 'boolean') {
            globPattern = validTriggeredPath;
        } else {
            globPattern = addParentToPath(lollygag._in, toRebuild);
        }
    }

    return lollygag.build({
        fullBuild: watchOptions.fullBuild,
        globPattern,
    });
}

let serverStarted = false;

export default function livedev(options: IWatchOptions): TWorker {
    return async function livedevWorker(files, lollygag): Promise<void> {
        const serverPort = options.serverPort || 3000;
        const livereloadPort = options.livereloadPort || 35729;

        if(options.injectLivereloadScript) {
            for(let i = 0; i < files.length; i++) {
                const file = files[i];

                if(extname(file.path) !== '.html') continue;

                const doc = parse(file.content || '');
                const body = doc.querySelector('body');

                if(!body) continue;

                const script = parse(
                    `<script src='http://localhost:${livereloadPort}/livereload.js'></script>`
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

        const toWatch: TToWatch[] = [];

        Object.keys(options.patterns).forEach((pattern) => {
            toWatch.push(pattern);
        });

        const watched = watcher(toWatch, {ignoreInitial: true});

        watched.on('add', async(path) => {
            await rebuild({
                eventSuffix: 'added',
                triggeredPath: path,
                watchOptions: options,
                lollygag,
            });
        });

        watched.on('change', async(path) => {
            await rebuild({
                eventSuffix: 'changed',
                triggeredPath: path,
                watchOptions: options,
                lollygag,
            });
        });
    };
}
