import { IFile } from '../../..';
import { IGenerated, IImagesMetaProps, ValidMimetypes } from '..';
import { IHandlerOptions } from './generateImage';
export interface IProcessImagesArgs {
    fileCopy: IFile;
    originalFilePath: string;
    fullImgPath: string;
    fileMimetype: ValidMimetypes;
    sizesObj: IGenerated;
    handlerOptions: IHandlerOptions;
    oldFileMeta?: IImagesMetaProps;
    previouslyProcessed?: boolean;
    quality?: number;
}
export default function processImages(args: IProcessImagesArgs): Promise<IFile[]>;
