import { TWorker } from '@lollygag/core';
export interface IImagesOptions {
    imageCompressorOptions?: any;
}
export default function images(options?: IImagesOptions): TWorker;
