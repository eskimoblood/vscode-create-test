import * as vscode from 'vscode'
import * as filepath from 'filepath'
import { Uri } from 'vscode'

const debugMsg = (msg) => vscode.debug.activeDebugConsole.appendLine(msg)

const slashChar = (filepath.create("dir1", "dir2").toString().indexOf("\\") > 0) ? "\\" : "/"

const isRelativeFolder = config => config.testFolder.startsWith('./')

const pathFromUri = ({ fsPath }: Uri) => filepath.create(fsPath)

const unixifyPath = (path) => (slashChar == "\\") ? path.replace(/\\/g, "/") : path

const isTestModule = ({ uri, workSpaceUri, config }) => {
    const path = uri.fsPath.replace(workSpaceUri.fsPath, '')
    return isRelativeFolder(config)
        ? filepath.create(filepath.create(path).dirname()).basename() == config.testFolder.substr(2)
        : path.startsWith(slashChar + config.testFolder)
}

const relativePath = (uri: Uri, workSpaceUri: Uri, config) => {
	const path = pathFromUri(uri).dir()
	return isTestModule(uri, workSpaceUri, config) ? path.dir() : path.append(config.testFolder.replace('./', ''))
}

const absolutePath = (uri: Uri, workSpaceUri: Uri, config) => {
    let path = uri.fsPath.replace(workSpaceUri.fsPath, '')
	const _isTestModule = isTestModule(uri, workSpaceUri, config)
    if (_isTestModule)
        path = path.replace(new RegExp(`^\\${slashChar}${config.testFolder}\\${slashChar}`), (config.srcFolder ? slashChar + config.srcFolder : '') + slashChar)
    else if (config.srcFolder)
        path = path.replace(new RegExp(`^\\${slashChar}${config.srcFolder}\\${slashChar}`), slashChar)
    var retval = pathFromUri(workSpaceUri)
    if (!_isTestModule)
        retval = retval.append(config.testFolder)
    return retval
        .append(path)
        .dir()
}

const pathToNewFolder = (uri: Uri, workSpaceUri: Uri, config) =>
    isRelativeFolder(config)
        ? relativePath(uri, workSpaceUri, config)
        : absolutePath(uri, workSpaceUri, config)

const name = (p, ext) => p.basename(ext)

export const pathToFile = (uri: Uri, workSpaceUri: Uri, config) => {
    const _isTestModule = isTestModule(uri, workSpaceUri, config);
    const basename = name(pathFromUri(uri), _isTestModule ? config.testFileExtension : config.sourceFileExtension);
    const extname = _isTestModule ? config.sourceFileExtension : config.testFileExtension;
    return pathToNewFolder(uri, workSpaceUri, config).append(basename + extname);
    }

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
    const moduleName = name(filePath, config.sourceFileExtension)
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
