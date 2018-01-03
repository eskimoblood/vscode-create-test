import * as vscode from 'vscode'
import * as filepath from 'filepath'
import { Uri } from 'vscode'

const isRelativeFolder = config => config.testFolder.startsWith('./')

const pathFromUri = ({ path }: Uri) => filepath.create(path)

const relativePath = (uri, config) =>
    pathFromUri(uri)
        .dir()
        .append(config.testFolder.replace('./', ''))

const absolutePath = (uri: Uri, workSpaceUri: Uri, config) => {
    let path = uri.path.replace(workSpaceUri.path, '')
    if (config.srcFolder) {
        path = path.replace(new RegExp(`^/${config.srcFolder}/`), '/')
    }
    return pathFromUri(workSpaceUri)
        .append(config.testFolder)
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
        .create(p1.path)
        .dir()
        .relative(p2.path)

export const createFile = (file, uri, workSpaceUri, config): Thenable<any> => {
    const relativePath = getRelativePath(file, uri)
    const filePath = filepath.create(relativePath)
    const moduleName = name(filePath)
    const modulePath = relativePath.replace(filePath.extname(), '')
    return getTemplate(config).then(template =>
        file.write(
            template
                .map(line =>
                    line
                        .replace('${moduleName}', moduleName)
                        .replace('${modulePath}', modulePath)
                        .replace(/\${findPath\('((\/?\w\/?)+)'\)}/, (_, p) =>
                            getRelativePath(
                                file,
                                pathFromUri(workSpaceUri).append(p)
                            )
                        )
                )
                .join('\n')
        )
    )
}
