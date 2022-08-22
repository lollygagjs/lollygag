/* eslint-disable no-continue */
import {extname} from 'path';
import t from 'terser';
import {changeExtname, deepCopy, fullExtname, TWorker} from '@lollygag/core';

export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    minifyOptions?: t.MinifyOptions;
}

export default function terser(options?: IOptions): TWorker {
    return async function terserWorker(this: TWorker, files): Promise<void> {
        if(!files) return;

        const {minifyOptions} = options ?? {};
        const defaultExtname = '.js';
        const newExtname = options?.newExtname ?? defaultExtname;
        const targetExtnames = options?.targetExtnames ?? ['.js'];
        const keepOriginal = options?.keepOriginal ?? true;
        const makeNewFile = keepOriginal && newExtname !== defaultExtname;

        const promises = files.map(async(file) => {
            let _file = file;

            if(makeNewFile) _file = deepCopy(file);

            if(
                !targetExtnames.includes(extname(_file.path))
                || fullExtname(_file.path).endsWith('.min.js')
            ) {
                return;
            }

            let filePath = _file.path;

            if(newExtname !== false) {
                filePath = changeExtname(_file.path, newExtname);
            }

            const {code} = await t.minify(_file.content ?? '', minifyOptions);

            _file.path = filePath;
            _file.content = code;

            if(makeNewFile) files.push(_file);
        });

        await Promise.all(promises);
    };
}
