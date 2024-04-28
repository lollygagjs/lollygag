import {extname, join, resolve} from 'path';
import http from 'http';
import {log} from 'console';
import {FSWatcher, watch} from 'chokidar';
import {green} from 'chalk';
import {minimatch} from 'minimatch';
import handler from 'serve-handler';
import livereload from 'livereload';
import {parse} from 'node-html-parser';
import Lollygag, {removeUpToParentsFromPath, Worker} from '../..';

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

        const inDirs = [lollygag._contentDir, lollygag._staticDir];

        if(inDirs.some((dir) => minimatch(triggeredPath, join(dir, '**/*')))) {
            validTriggeredPath = removeUpToParentsFromPath(
                inDirs,
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
let server: http.Server | null = null;
let watcher: FSWatcher | null = null;

export function worker(options: IWatchOptions): Worker {
    return async function livedevWorker(files, lollygag): Promise<void> {
        const serverPort = options.serverPort ?? 3000;
        const livereloadHost = options.livereloadHost ?? 'localhost';
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

        const outputDir = resolve(lollygag._outputDir);

        server = http.createServer((req, res) =>
            handler(req, res, {
                public: outputDir,
                cleanUrls: true,
            }));

        await new Promise((ok) => {
            if(server) {
                server.listen(serverPort, () => {
                    log(green(`Server running at port ${serverPort}`));

                    ok(null);
                });
            }
        });

        await new Promise((ok) => {
            livereload
                .createServer({port: livereloadPort, usePolling: true}, () => {
                    log(
                        green(
                            `Livereload server running at port ${livereloadPort}`
                        )
                    );

                    ok(null);
                })
                .watch([outputDir, resolve('.timestamp')]);
        });

        const toWatch: ToWatch[] = [];

        Object.keys(options.patterns).forEach((pattern) => {
            toWatch.push(pattern);
        });

        watcher = watch(toWatch, {ignoreInitial: true});

        async function onAddOrChange(path: string) {
            if(watcher) {
                watcher.off('add', onAddOrChange);
                watcher.off('change', onAddOrChange);

                await rebuild({
                    eventSuffix: 'changed',
                    triggeredPath: path,
                    watchOptions: options,
                    lollygag,
                });

                watcher.on('add', onAddOrChange);
                watcher.on('change', onAddOrChange);
            }
        }

        watcher.on('add', onAddOrChange);
        watcher.on('change', onAddOrChange);
    };
}

export default worker;

process.on('SIGINT', () => {
    log('\nInterrupted. Shutting down livedevWorker...');
    if(server) server.close();
    if(watcher) watcher.close();
    process.exit(0);
});
