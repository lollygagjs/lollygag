/* eslint-disable no-continue */
import {extname} from 'path';
import {changeExtname, TFileHandler, TWorker} from '@lollygag/core';

export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    options?: any;
}

export const handle{{workerName}}: TFileHandler = (
    content,
    options?,
    data?
): string => {
    console.log(content);
    console.log(options);
    console.log(data);

    return '';
}

export default function {{workerName}}(options?: IOptions): TWorker {
    return function {{workerName}}Worker(this: TWorker, files, lollygag): void {
        if(!files) return;

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            const targetExtnames = [
                ...['.html'],
                ...(options?.targetExtnames || []),
            ];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(options?.newExtname !== false) {
                file.path = changeExtname(
                    file.path,
                    options?.newExtname || '.html'
                );
            }

            const data = {...lollygag._config, ...file};

            file.content = handle{{workerName}}(file.content || '', options, data);
        }
    };
}
