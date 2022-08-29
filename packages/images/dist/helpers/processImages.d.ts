import { IFile } from '@lollygag/core';
import { IGenerated, IImagesMeta, ValidMimetypes } from '..';
import { IHandlerOptions } from './generateImage';
export interface IProcessImagesArgs {
    fileCopy: IFile;
    originalFilePath: string;
    fullImgPath: string;
    fileMimetype: ValidMimetypes;
    sizesObj: IGenerated;
    handlerOptions: IHandlerOptions;
    oldMeta: IImagesMeta;
    previouslyProcessed?: boolean;
    quality?: number;
}
export default function processImages(args: IProcessImagesArgs): Promise<IFile[]>;
