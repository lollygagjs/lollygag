import {promises as fsp} from 'fs';
import grayMatter from 'gray-matter';
import Lollygag, {IFile} from '..';
import {getFileMimetype} from './general';

export default function parseFiles(
    this: Lollygag,
    files: string[]
): Promise<IFile[]> {
    const promises = files.map(async(file): Promise<IFile> => {
        const fileMimetype = await getFileMimetype(file);
        const fileStats = await fsp.stat(file);

        if(
            fileMimetype.startsWith('text/')
            || fileMimetype === 'inode/x-empty'
        ) {
            let rawFileContent = await fsp.readFile(file, {
                encoding: 'utf-8',
            });

            rawFileContent = this.handleTemplating(
                rawFileContent,
                this._config.templatingHandlerOptions ?? null,
                {...this._config, ...this._meta}
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
