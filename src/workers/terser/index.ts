import {extname} from 'path';
import t from 'terser';
import {changeExtname, deepCopy, fullExtname, Worker} from '../..';

export interface ITerserWorkerOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    minifyOptions?: t.MinifyOptions;
}

export function worker(options?: ITerserWorkerOptions): Worker {
    return async function terserWorker(files): Promise<void> {
        if(!files) return;

        const defaultExtname = '.js';

        const {
            minifyOptions,
            newExtname = defaultExtname,
            targetExtnames = ['.js'],
            keepOriginal = true,
        } = options ?? {};

        const makeNewFile = keepOriginal && newExtname !== defaultExtname;

        const promises = files.map(async(f) => {
            let file = f;

            if(makeNewFile) file = deepCopy(f);

            if(
                !targetExtnames.includes(extname(file.path))
                || fullExtname(file.path).endsWith('.min.js')
            ) {
                return;
            }

            let filePath = file.path;

            if(newExtname !== false) {
                filePath = changeExtname(file.path, newExtname);
            }

            const {code} = await t.minify(file.content ?? '', minifyOptions);

            file.path = filePath;
            file.content = code;

            if(makeNewFile) files.push(file);
        });

        await Promise.all(promises);
    };
}

export default worker;
