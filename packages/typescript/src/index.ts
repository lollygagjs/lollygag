/* eslint-disable no-continue */
import {extname} from 'path';
import {changeExtname, TWorker} from '@lollygag/core';
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

export function typescript(options?: ITypescriptOptions): TWorker {
    return function typescriptWorker(this: TWorker, files): void {
        if(!files) return;

        const {target, module} = options?.compilerOptions ?? {};
        const newExtname = options?.newExtname ?? '.js';
        const targetExtnames = options?.targetExtnames ?? ['.ts'];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            file.content = transpile(file.content ?? '', {
                module: ModuleKind[module || 'ES2015'],
                target: ScriptTarget[target || 'ES2015'],
            });

            if(newExtname !== false) {
                file.path = changeExtname(file.path, newExtname);
            }
        }
    };
}

export default typescript;
