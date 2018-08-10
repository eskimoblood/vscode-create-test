import * as vscode from 'vscode'
import * as filepath from 'filepath'
import { Uri } from 'vscode'

const debugMsg = (msg) => vscode.debug.activeDebugConsole.appendLine(msg)

const slashChar = (filepath.create("dir1", "dir2").toString().indexOf("\\") > 0) ? "\\" : "/"

const isRelativeFolder = config => config.testFolder.startsWith('./')

const pathFromUri = ({ fsPath }: Uri) => filepath.create(fsPath)

const unixifyPath = (path) => (slashChar == "\\") ? path.replace(/\\/g, "/") : path

const relativePath = (uri, config) => {
	const path = pathFromUri(uri).dir()
	const isTestModule = (path.basename() == config.testFolder.substr(2))
	return isTestModule ? path.dir() : path.append(config.testFolder.replace('./', ''))
}

const absolutePath = (uri: Uri, workSpaceUri: Uri, config) => {
    let path = uri.fsPath.replace(workSpaceUri.fsPath, '')
    const isTestModule = path.startsWith(slashChar + config.testFolder)
    if (isTestModule)
        path = path.replace(new RegExp(`^\\${slashChar}${config.testFolder}\\${slashChar}`), (config.srcFolder ? slashChar + config.srcFolder : '') + slashChar)
    else if (config.srcFolder)
        path = path.replace(new RegExp(`^\\${slashChar}${config.srcFolder}\\${slashChar}`), slashChar)
    var retval = pathFromUri(workSpaceUri)
    if (!isTestModule)
        retval = retval.append(config.testFolder)
    return retval
        .append(path)
        .dir()
}

const pathToTestFolder = (uri: Uri, workSpaceUri: Uri, config) =>
    isRelativeFolder(config)
        ? relativePath(uri, config)
        : absolutePath(uri, workSpaceUri, config)

const name = p => p.basename(p.extname())

export const pathToFile = (uri: Uri, workSpaceUri: Uri, config) =>
    pathToTestFolder(uri, workSpaceUri, config).append(
        name(pathFromUri(uri)) + config.testFileExtension
    )

const getTemplate = (config: {
    testFileTemplate: Array<String> | Object
}): Thenable<Array<String>> =>
    Array.isArray(config.testFileTemplate)
        ? Promise.resolve(config.testFileTemplate)
        : vscode.window
              .showQuickPick(Object.keys(config.testFileTemplate))
              .then(key => config.testFileTemplate[key])

const getRelativePath = (p1, p2) =>
    filepath
        .create(p1)
        .dir()
        .relative(p2.toString())

export const createFile = (file, uri, workSpaceUri, config): Thenable<any> => {
    const filePath = filepath.create(uri.fsPath)
    const relativePath = getRelativePath(file, filePath)
    const moduleName = name(filePath)
    const modulePath = relativePath.replace(filePath.extname(), '')
    return getTemplate(config).then(template =>
        file.write(
            template
                .map(line =>
                    line
                        .replace('${moduleName}', moduleName)
                        .replace('${modulePath}', unixifyPath(modulePath))
                        .replace(/\${findPath\('((\/?\w\/?)+)'\)}/, (_, p) =>
                            unixifyPath(
                                getRelativePath(
                                    file,
                                    pathFromUri(workSpaceUri).append(p)
                                )
                            )
                        )
                )
                .join('\n')
        )
    )
}
