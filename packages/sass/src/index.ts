/* eslint-disable no-continue */
import {basename, extname, join} from 'path';
import {renderSync, SyncOptions} from 'node-sass';
import {changeExtname, TWorker} from '@lollygag/core';

export interface ISassOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    nodeSassOptions?: SyncOptions;
}

export function sass(options?: ISassOptions): TWorker {
    return function sassWorker(this: TWorker, files): void {
        if(!files) return;

        const excludes: number[] = [];

        const nodeSassOptions: SyncOptions = {
            sourceMap: true,
            sourceMapContents: true,
            ...options?.nodeSassOptions,
        };

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = options?.targetExtnames || [
                '.scss',
                '.sass',
            ];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(basename(file.path).startsWith('_')) {
                excludes.push(i);
                continue;
            }

            let outFile = file.path;

            if(options?.newExtname !== false) {
                outFile = changeExtname(
                    file.path,
                    options?.newExtname || '.css'
                );
            }

            const result = renderSync({
                ...nodeSassOptions,
                file: file.path,
                outFile,
            });

            file.path = outFile;
            file.content = result.css.toString();

            if(nodeSassOptions.sourceMap) {
                const sourcemapPath = join(`${outFile}.map`);

                file.map = sourcemapPath;

                const sourcemapContent = result.map.toString();

                files.push({
                    path: sourcemapPath,
                    content: sourcemapContent,
                    mimetype: 'application/json',
                });
            }
        }

        while(excludes.length) {
            const indexToRemove = excludes.pop() as number;

            files.splice(indexToRemove, 1);
        }
    };
}

export default sass;
