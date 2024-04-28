import {promises as fsp} from 'fs';
import grayMatter from 'gray-matter';
import Lollygag, {IFile} from '..';
import {getFileMimetype} from './general';

export default function parseFiles(this: Lollygag, files: string[]) {
    const promises = files.map(async(file): Promise<IFile> => {
        const fileMimetype = await getFileMimetype(file);
        const fileStats = await fsp.stat(file);

        // if file size is 0, return immediately
        if(fileStats.size === 0) {
            return {path: file, mimetype: fileMimetype, exclude: true};
        }

        if(
            fileMimetype.startsWith('text/')
            || fileMimetype === 'inode/x-empty'
        ) {
            let rawFileContent = await fsp.readFile(file, {
                encoding: 'utf-8',
            });

            // if file is empty return immediately
            if(!rawFileContent.trim()) {
                return {
                    path: file,
                    mimetype: fileMimetype,
                    exclude: true,
                };
            }

            rawFileContent = this.handleTemplating(
                rawFileContent,
                this._config.templatingHandlerOptions ?? null,
                {...this._config, ...this._sitemeta}
            );

            const grayMatterResult = grayMatter(rawFileContent);

            grayMatterResult.content = this.handleTemplating(
                grayMatterResult.content,
                this._config.templatingHandlerOptions ?? null,
                grayMatterResult.data
            );

            return {
                path: file,
                content: grayMatterResult.content,
                mimetype: fileMimetype,
                ...grayMatterResult.data,
                stats: fileStats,
            };
        }

        return {path: file, mimetype: fileMimetype, stats: fileStats};
    });

    return Promise.all(promises);
}
