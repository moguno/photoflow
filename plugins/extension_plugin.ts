import { FileInfo } from '../fileinfo'
import { Plugin } from '../plugin'

/**
 * 拡張子加工プラグイン
 */
class ExtensionPlugin implements Plugin {

    /**
     * プラグインの機能テーブルを返す
     * @returns 機能名とメソッドのハッシュ
     */
    getFunctions(): { [name: string]: string } {
        return { "extension": "changeExtension" }
    }

    /**
     * 処理
     * @param fileInfo 
     */
    changeExtension(fileInfo: FileInfo, params: { [index: string]: any }): FileInfo {
        if (params["lowerCase"]) {
            fileInfo.newExtension = fileInfo.newExtension?.toLowerCase();
        } else {
            fileInfo.newExtension = fileInfo.newExtension?.toUpperCase();
        }

        return fileInfo
    }
}

const instance = new ExtensionPlugin()

export { instance }