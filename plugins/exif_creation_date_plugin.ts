import { FileInfo } from '../fileinfo'
import { Plugin } from '../plugin'
import { execSync } from 'child_process'
import { DateTime } from 'luxon'
import { sprintf } from 'sprintf-js'

/**
 * Exifの撮影時刻
 */
class ExifCreationDatePlugin implements Plugin {

    /**
     * プラグインの機能テーブルを返す
     * @returns 機能名とメソッドのハッシュ
     */
    getFunctions(): { [name: string]: string } {
        return {
            "rename-exif-creation-date": "renameExifCreationDate",
            "move-exif-creation-date": "moveExifCreationDate",

        }
    }

    /**
     * 画像のExif情報を得る（要exiftool）
     * @param path 画像ファイルのパス
     * @returns Exif情報
     */
    private getExif(path: string): { [index: string]: string } {
        const stdout = execSync(`exiftool -s ${path}`)

        return stdout.toString().split(/\n/).reduce((result, line) => {
            const kv = line.match(/^([^:]+):(.+)$/)

            if (kv !== null && (1 in kv) && (2 in kv)) {
                result[kv[1].trim()] = kv[2].trim()
            }

            return result
        }, {})
    }

    private getCreationDate(path: string): DateTime {
        const exif = this.getExif(path)
        const creationDate = DateTime.fromFormat(exif["CreateDate"], "yyyy:MM:dd hh:mm:ss")

        return creationDate
    }

    /**
     * リネーム処理
     * @param fileInfo 
     * @param params
     */
    renameExifCreationDate(fileInfo: FileInfo, params: { [index: string]: any }): FileInfo {
        const creationDate = this.getCreationDate(fileInfo.originalFilePath)

        const newFilename = sprintf(params["newName"], {
            originalName: fileInfo.newFilename,
            year: creationDate.year,
            month: creationDate.month,
            day: creationDate.day,
            hour: creationDate.hour,
            minute: creationDate.minute,
            second: creationDate.second
        })

        fileInfo.newFilename = newFilename

        return fileInfo
    }

    /**
     * ディレクトリ移動処理
     * @param fileInfo 
     * @param params
     */
    moveExifCreationDate(fileInfo: FileInfo, params: { [index: string]: any }): FileInfo {
        const creationDate = this.getCreationDate(fileInfo.originalFilePath)

        const toDir = sprintf(params["newName"], {
            originalName: fileInfo.newFilename,
            year: creationDate.year,
            month: creationDate.month,
            day: creationDate.day,
            hour: creationDate.hour,
            minute: creationDate.minute,
            second: creationDate.second
        })

        fileInfo.toDir = toDir

        return fileInfo
    }
}

const instance = new ExifCreationDatePlugin()

export { instance }
