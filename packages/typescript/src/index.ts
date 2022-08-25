/* eslint-disable no-continue */
import {extname} from 'path';
import {changeExtname,Worker} from '@lollygag/core';
import {ModuleKind, ScriptTarget, transpile} from 'typescript';

export interface ICompilerOptions {
    module?: keyof typeof ModuleKind;
    target?: keyof typeof ScriptTarget;
}

export interface ITypescriptOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    compilerOptions?: ICompilerOptions;
}

export function typescript(options?: ITypescriptOptions):Worker {
    return function typescriptWorker(this:Worker, files): void {
        if(!files) return;

        const {
            newExtname = ',js',
            targetExtnames = ['.ts'],
            compilerOptions,
        } = options ?? {};

        const {target, module} = compilerOptions ?? {};

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            file.content = transpile(file.content ?? '', {
                module: ModuleKind[module ?? 'ES2015'],
                target: ScriptTarget[target ?? 'ES2015'],
            });

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }
        }
    };
}

export default typescript;
