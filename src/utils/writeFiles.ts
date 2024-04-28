import fs, {promises as fsp} from 'fs';
import {join, dirname} from 'path';
import Lollygag, {IFile, removeUpToParentsFromPath} from '..';

export default function writeFiles(
    this: Lollygag,
    files: IFile[]
): Promise<void[]> {
    const promises = files.map(async(file): Promise<void> => {
        /**
         * Change `file.path` to final output path.
         */
        const filePath = join(
            this._out,
            // TODO: Ooooooh
            removeUpToParentsFromPath(
                [this._contentDir, this._staticDir],
                file.path
            )
        );

        const fileDir = dirname(filePath);

        if(!fs.existsSync(fileDir)) {
            await fsp.mkdir(fileDir, {recursive: true});
        }

        if(
            file.mimetype.startsWith('text/')
            || file.mimetype === 'inode/x-empty'
            || file.mimetype === 'application/json'
        ) {
            await fsp.writeFile(filePath, file.content ?? '');
        } else {
            await fsp.copyFile(file.path, filePath);
        }
    });

    const timestamp = this._config.generateTimestamp
        ? fsp.writeFile('.timestamp', new Date().getTime().toString())
        : Promise.resolve();

    return Promise.all([...promises, timestamp]);
}
