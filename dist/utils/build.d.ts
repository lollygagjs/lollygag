import Lollygag from '..';
export interface IBuildOptions {
    fullBuild?: boolean;
    allowExternalDirectories?: boolean;
    allowWorkingDirectoryOutput?: boolean;
    globPattern?: string | null;
}
export default function build(this: Lollygag, options?: IBuildOptions): Promise<void>;
