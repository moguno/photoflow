import { FileInfo } from "./fileinfo"

/**
 * プラグイン
 */
interface Plugin {
    /** 機能一覧を返す */
    getFunctions(): { [name: string]: string }
}

export { Plugin }

