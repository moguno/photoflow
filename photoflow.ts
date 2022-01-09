import * as fs from 'fs'
import * as path from 'path'
import { recipe } from './recipe'
import { FileInfo } from './fileinfo'
import { Plugin } from './plugin'

/**
 * 対象フォルダの処理対象ファイルを得る
 * @param srcDir 
 * @returns 
 */
function getTargetFiles(srcDir: string): FileInfo[] {
	const targetFiles = fs.readdirSync(srcDir, { withFileTypes: true })
		.filter(entry => entry.isFile())
		.filter(entry => /\.(mp4|jpg|cr2)$/.test(entry.name.toLowerCase()))
		.map(entry => {
			const extension = (entry.name.match(/\.[^\.]+/) ?? [])[0] ?? ""
			const filenameWithoutExtension = path.basename(entry.name, extension)

			return new FileInfo({
				originalFilePath: path.join(srcDir, entry.name),
				originalExtension: extension,
				toDir: srcDir,
				newFilename: filenameWithoutExtension,
				newExtension: extension
			})
		})

	return targetFiles
}

/**
 * プラグインを読み込む
 * @returns 
 */
async function loadPlugins(): Promise<{ [functionName: string]: { instance: Plugin, func: string } }> {
	const files = await fs.readdirSync("./plugins", { withFileTypes: true }).filter(file => /\.js$/.test(file.name))

	const plugins: { [functionName: string]: { instance: Plugin, func: string } } = {}

	for (const file of files) {
		const pluginFilename = "./" + path.join("plugins", file.name)
		const plugin = await import(pluginFilename)

		const functions = plugin.instance.getFunctions()

		for (const functionName in functions) {
			plugins[functionName] = {
				instance: plugin.instance,
				func: functions[functionName]
			}
		}
	}

	return plugins
}

/**
 * ファイルを操作する
 * @param fileInfo ファイル情報 
 */
function manipulateFile(destinationDir: string, fileInfo: FileInfo): void {
	if (fileInfo.toDir == null || fileInfo.newFilename == null || fileInfo.newExtension == null) {
		return
	}

	const toPath = path.join(destinationDir, fileInfo.toDir)
	const toFilePath = path.join(toPath, fileInfo.newFilename + fileInfo.newExtension)

	// コピー先ディレクトリの作成
	fs.mkdirSync(toPath, { recursive: true })

	// ファイルの移動
	fs.renameSync(fileInfo.originalFilePath,toFilePath)
}

// プラグインを読み込む
loadPlugins().then(plugins => {
	// 分類フォルダから対象ファイルの一覧を得る
	const targetFiles = getTargetFiles(process.argv[2] ?? "")
	const destinationDir = process.argv[3]

	if (!fs.statSync(destinationDir).isDirectory) {
		console.error("Destination Directory is not found")
		process.exit(1)
	}

	// 対象ファイルを処理する
	targetFiles.forEach(file => {
		let target = file

		// レシピに沿って処理する
		recipe.forEach(item => {
			if (item["plugin"]) {
				const pluginName: string = item["plugin"]

				if (plugins[pluginName]) {
					const targetPromise = plugins[pluginName].instance[plugins[pluginName].func](target, item["params"])
				} else {
					throw "プラグインが存在しません：" + pluginName
				}
			}
		})

		// 処理結果によってファイルを操作する
		manipulateFile(destinationDir, target)
	})

	process.exit(0)
})