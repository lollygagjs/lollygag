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

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = options?.targetExtnames || ['.ts'];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            file.content = transpile(
                file.content || '',
                options?.compilerOptions
            );

            if(options?.newExtname !== false) {
                file.path = changeExtname(
                    file.path,
                    options?.newExtname || '.js'
                );
            }
        }
    };
}

export default typescript;
