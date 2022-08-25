import {extname, basename, join, dirname} from 'path';
import {changeExtname, IFile} from '..';

export default function generatePrettyUrls(files: IFile[]): IFile[] {
    return files.map((file): IFile => {
        if(
            extname(file.path) === '.html'
            && basename(file.path) !== 'index.html'
        ) {
            return {
                ...file,
                path: join(
                    dirname(file.path),
                    changeExtname(basename(file.path), ''),
                    'index.html'
                ),
            };
        }

        return file;
    });
}
