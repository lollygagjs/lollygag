/* eslint-disable no-continue */
import {extname, join} from 'path';
import {changeExtname, fullExtname, TWorker} from '@lollygag/core';

import pcss, {AcceptedPlugin, ProcessOptions} from 'postcss';

export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}

export default function postcss(options?: IOptions): TWorker {
    const keepOriginal = options?.keepOriginal || true;

    return async function postcssWorker(this: TWorker, files): Promise<void> {
        if(!files) return;

        const promises = files.map(async(file) => {
            let _file = file;

            if(options?.newExtname && keepOriginal) _file = {...file};

            const targetExtnames = [
                ...['.css', '.pcss'],
                ...(options?.targetExtnames || []),
            ];

            if(
                !targetExtnames.includes(extname(_file.path))
                || fullExtname(_file.path).endsWith('.min.css')
            ) {
                return;
            }

            const existingSourcemap = files.find(
                (f) => f.path === join(`${file.path}.map`)
            );

            let filePath = _file.path;

            if(options?.newExtname !== false) {
                filePath = changeExtname(
                    _file.path,
                    options?.newExtname || '.css'
                );
            }

            const result = await pcss(options?.plugins).process(
                _file.content || '',
                {
                    from: file.path,
                    to: filePath,
                    map: {
                        inline: false,
                        prev: existingSourcemap
                            ? existingSourcemap.content
                            : false,
                    },
                    ...options?.processOptions,
                }
            );

            _file.path = filePath;
            _file.content = result.css;

            if(options?.newExtname && keepOriginal) {
                files.push(_file);
            }

            if(result.map) {
                if(options?.newExtname) {
                    if(!keepOriginal && existingSourcemap) {
                        existingSourcemap.path = join(`${filePath}.map`);
                        existingSourcemap.content = result.map.toString();
                    } else {
                        files.push({
                            path: join(`${filePath}.map`),
                            content: result.map.toString(),
                            mimetype: 'application/json',
                        });
                    }
                } else if(existingSourcemap) {
                    existingSourcemap.content = result.map.toString();
                } else {
                    files.push({
                        path: join(`${filePath}.map`),
                        content: result.map.toString(),
                        mimetype: 'application/json',
                    });
                }
            }
        });

        await Promise.all(promises);
    };
}
