/**
 *  ファイル情報
 */
class FileInfo {
    toDir?: string
    newFilename?: string
    newExtension?: string
    originalFilePath: string = ""
    originalExtension: string = ""

    /**
     * コンストラクタ
     * @param init 初期値
     */
    constructor(init?: Partial<FileInfo>) {
        Object.assign(this, init)
    }
}

export { FileInfo }
