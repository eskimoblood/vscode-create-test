import * as vscode from 'vscode'
import * as filepath from 'filepath'
import { Uri } from 'vscode'
import { pathToFile, createFile } from './pathUtils'

const openFile = file =>
    vscode.workspace
        .openTextDocument(file.toString())
        .then(vscode.window.showTextDocument)

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'extension.createTest',
        () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) {
                return
            }
            const uri = editor.document.uri
            const workSpaceUri = vscode.workspace.getWorkspaceFolder(uri).uri
            const config = vscode.workspace.getConfiguration('createTest')
            const file = pathToFile(uri, workSpaceUri, config)
            if (file.exists()) {
                openFile(file)
            } else {
                createFile(file, uri, workSpaceUri, config).then(openFile)
            }
        }
    )

    context.subscriptions.push(disposable)
}

export function deactivate() {}
