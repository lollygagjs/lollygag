/* eslint-disable no-continue */
import {extname} from 'path';
import {changeExtname, TWorker} from '@lollygag/core';
import {CompilerOptions, transpile} from 'typescript';

export interface ITypescriptOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compilerOptions?: CompilerOptions;
}

export function typescript(options?: ITypescriptOptions): TWorker {
    return function typescriptWorker(this: TWorker, files): void {
        if(!files) return;

        const {newExtname, targetExtnames, compilerOptions} = options ?? {};

        const _newExtname = newExtname ?? '.js';
        const _targetExtnames = targetExtnames ?? ['.ts'];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!_targetExtnames.includes(extname(file.path))) {
                continue;
            }

            file.content = transpile(file.content ?? '', compilerOptions);

            if(_newExtname !== false) {
                file.path = changeExtname(file.path, _newExtname);
            }
        }
    };
}

export default typescript;
