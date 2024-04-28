import {basename, extname, join} from 'path';
import {compile, Options} from 'sass';
import {changeExtname, IFile, Worker} from '../..';

export interface ISassOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    sassOptions?: Options<'sync'>;
}

export function worker(options?: ISassOptions): Worker {
    return function sassWorker(files: IFile[]): void {
        if(!files) return;

        const {
            newExtname = '.css',
            targetExtnames = ['.scss', '.sass'],
            sassOptions,
        } = options ?? {};

        const mergedSassOptions: ISassOptions['sassOptions'] = {
            sourceMap: true,
            sourceMapIncludeSources: true,
            style: 'expanded',
            ...sassOptions,
        };

        const excludes: number[] = [];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];

            if(!targetExtnames.includes(extname(file.path))) {
                continue;
            }

            if(basename(file.path).startsWith('_')) {
                excludes.push(i);

                continue;
            }

            let outFile = file.path;

            if(newExtname !== false) {
                outFile = changeExtname(file.path, newExtname);
            }

            const result = compile(file.path, mergedSassOptions);

            file.path = outFile;
            file.content = result.css;

            if(mergedSassOptions.sourceMap && file.content) {
                const sourcemapPath = join(`${outFile}.map`);

                file.map = sourcemapPath;

                file.content += `\n\n/*# sourceMappingURL=${basename(
                    sourcemapPath
                )} */\n`;

                const sourcemapContent = JSON.stringify(result.sourceMap);

                files.push({
                    path: sourcemapPath,
                    content: sourcemapContent,
                    mimetype: 'application/json',
                });
            }
        }

        while(excludes.length) {
            const indexToRemove = excludes.pop();

            if(typeof indexToRemove === 'number') {
                files.splice(indexToRemove, 1);
            }
        }
    };
}

export default worker;
