import {extname, join} from 'path';
import pcss, {AcceptedPlugin, ProcessOptions} from 'postcss';
import {changeExtname, deepCopy, fullExtname, Worker} from '@lollygag/core';

export interface IOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    keepOriginal?: boolean;
    plugins?: AcceptedPlugin[];
    processOptions?: ProcessOptions;
}

export function postcss(options?: IOptions): Worker {
    return async function postcssWorker(files): Promise<void> {
        if(!files) return;

        const defaultExtname = '.css';

        const {
            newExtname = defaultExtname,
            targetExtnames = ['.css', '.pcss'],
            keepOriginal = true,
            plugins,
            processOptions,
        } = options ?? {};

        const makeNewFile = keepOriginal && newExtname !== defaultExtname;

        const promises = files.map(async(f) => {
            let file = f;

            if(makeNewFile) file = deepCopy(f);

            if(
                !targetExtnames.includes(extname(file.path))
                || fullExtname(file.path).endsWith('.min.css')
            ) {
                return;
            }

            const existingSourcemap = files.find(
                (x) => x.path === join(`${f.path}.map`)
            );

            let filePath = file.path;

            if(newExtname !== false) {
                filePath = changeExtname(file.path, newExtname);
            }

            const result = await pcss(plugins).process(file.content ?? '', {
                from: f.path,
                to: filePath,
                map: {
                    inline: false,
                    prev: existingSourcemap ? existingSourcemap.content : false,
                },
                ...processOptions,
            });

            file.path = filePath;
            file.content = result.css;

            if(makeNewFile) files.push(file);

            if(result.map) {
                if(newExtname) {
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

export default postcss;
