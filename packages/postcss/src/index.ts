/* eslint-disable no-continue */
import {extname, join} from 'path';
import pcss, {AcceptedPlugin, ProcessOptions} from 'postcss';
import {changeExtname, fullExtname, TWorker} from '@lollygag/core';

export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}

export function postcss(options?: IOptions): TWorker {
    return async function postcssWorker(this: TWorker, files): Promise<void> {
        if(!files) return;

        const {
            newExtname,
            targetExtnames,
            keepOriginal,
            plugins,
            processOptions,
        } = options ?? {};

        const _newExtname = newExtname ?? '.css';
        const _targetExtnames = targetExtnames ?? ['.css', '.pcss'];
        const _keepOriginal = keepOriginal ?? true;

        const promises = files.map(async(file) => {
            let _file = file;

            if(_newExtname && _keepOriginal) _file = {...file};

            if(
                !_targetExtnames.includes(extname(_file.path))
                || fullExtname(_file.path).endsWith('.min.css')
            ) {
                return;
            }

            const existingSourcemap = files.find(
                (f) => f.path === join(`${file.path}.map`)
            );

            let filePath = _file.path;

            if(_newExtname !== false) {
                filePath = changeExtname(_file.path, _newExtname);
            }

            const result = await pcss(plugins).process(_file.content ?? '', {
                from: file.path,
                to: filePath,
                map: {
                    inline: false,
                    prev: existingSourcemap ? existingSourcemap.content : false,
                },
                ...processOptions,
            });

            _file.path = filePath;
            _file.content = result.css;

            if(options?.newExtname && _keepOriginal) {
                files.push(_file);
            }

            if(result.map) {
                if(options?.newExtname) {
                    if(!_keepOriginal && existingSourcemap) {
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

export default postcss;
