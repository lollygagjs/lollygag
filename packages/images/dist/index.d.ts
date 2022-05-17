import { TWorker } from '@lollygag/core';
export interface IImagesOptions {
    newExtname?: string | false;
    targetExtnames?: string[];
    imageCompressorOptions?: any;
}
export default function images(options?: IImagesOptions): TWorker;
