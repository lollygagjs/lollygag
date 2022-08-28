import { IFile } from '@lollygag/core';
import { ValidMimetypes } from '..';
import { IHandlerOptions } from './generateImage';
interface IXArgs {
    fileCopy: IFile;
    originalFilePath: string;
    fullImgPath: string;
    fileMimetype: ValidMimetypes;
    widthsPaths: string[];
    handlerOptions: IHandlerOptions;
    previouslyProcessed?: boolean;
    quality?: number;
}
export declare function processImages(args: IXArgs): Promise<IFile[]>;
export {};
