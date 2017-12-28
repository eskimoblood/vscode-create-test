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

export const createFile = (file, uri, config): Promise<any> => {
    const relativePath = filepath
        .create(file.path)
        .dir()
        .relative(uri.path)
    const filePath = filepath.create(relativePath)
    const moduleName = name(filePath)
    const modulePath = relativePath.replace(filePath.extname(), '')
    return file.write(
        config.testFileTemplate
            .map(line =>
                line
                    .replace('${moduleName}', moduleName)
                    .replace('${modulePath}', modulePath)
            )
            .join('\n')
    )
}
