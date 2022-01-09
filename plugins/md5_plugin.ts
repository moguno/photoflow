import { FileInfo } from '../fileinfo'
import { Plugin } from '../plugin'
import * as fs from 'fs'
import * as crypto from 'crypto'
import { sprintf } from 'sprintf-js'

/**
 * ファイル名にMD5値を付与するクラス
 */
class MD5Plugin implements Plugin {

    /**
     * プラグインの機能テーブルを返す
     * @returns 機能名とメソッドのハッシュ
     */
    getFunctions(): { [name: string]: string } {
        return { "rename-md5": "proc" }
    }

    /**
     * MD5値を取得
     * @param path 
     * @returns 
     */
    private getMD5(path: string): string {
        const target = fs.readFileSync(path)
        const md5hash = crypto.createHash('md5')

        md5hash.update(target)

        return md5hash.digest("hex")
    }

    /**
     * 処理
     * @param fileInfo 
     */
    proc(fileInfo: FileInfo, params: { [index: string]: any }): FileInfo {
        const md5 = this.getMD5(fileInfo.originalFilePath)

        const newFilename = sprintf(params["newName"], {
            originalFilename: fileInfo.newFilename,
            lowerCase: md5.toLocaleLowerCase(),
            upperCase: md5.toUpperCase()
        })

        fileInfo.newFilename = newFilename

        return fileInfo
    }
}

const instance = new MD5Plugin()

export { instance }