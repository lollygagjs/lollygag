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

        const {newExtname, targetExtnames, nodeSassOptions} = options ?? {};

        const _newExtname = newExtname ?? '.css';
        const _targetExtnames = targetExtnames ?? ['.scss', '.sass'];

        const _nodeSassOptions = {
            sourceMap: true,
            sourceMapContents: true,
            ...nodeSassOptions,
        };

        const excludes: number[] = [];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!_targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(basename(file.path).startsWith('_')) {
                excludes.push(i);

                continue;
            }

            let outFile = file.path;

            if(_newExtname !== false) {
                outFile = changeExtname(file.path, _newExtname);
            }

            const result = renderSync({
                ..._nodeSassOptions,
                file: file.path,
                outFile,
            });

            file.path = outFile;
            file.content = result.css.toString();

            if(_nodeSassOptions.sourceMap) {
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
