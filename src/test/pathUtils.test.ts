import * as assert from 'assert'
import * as vscode from 'vscode'
import * as pathUtils from '../pathUtils'
import Uri from 'vscode-uri'

suite('PathUtils', () => {
    const uri = Uri.file('/User/someUser/project/src/folder1/file.js')
    const workSpaceUri = Uri.file('/User/someUser/project')

    test('find path to file in absolute test folder', () => {
        const config = { testFolder: 'test', testFileExtension: '.spec.js' }
        const path = pathUtils.pathToFile(uri, workSpaceUri, config)
        assert.equal(
            path,
            '/User/someUser/project/test/src/folder1/file.spec.js'
        )
    })

    test('find path to file in relative test folder', () => {
        const config = { testFolder: './test', testFileExtension: '.spec.js' }
        const path = pathUtils.pathToFile(uri, workSpaceUri, config)
        assert.equal(
            path,
            '/User/someUser/project/src/folder1/test/file.spec.js'
        )
    })

    test('find path to file in absolute test folder with srcFolder defined', () => {
        const config = {
            testFolder: 'test',
            testFileExtension: '.spec.js',
            srcFolder: 'src/folder1',
        }
        const path = pathUtils.pathToFile(uri, workSpaceUri, config)
        assert.equal(path, '/User/someUser/project/test/file.spec.js')
    })

    test('it writes the file', () => {
        const config = {
            testFileTemplate: ["import ${moduleName} from '${modulePath}'"],
        }
        let r
        const file = {
            path: '/User/someUser/project/test/src/folder1/file.spec.js',
            write: p => (r = p),
        }
        pathUtils.createFile(file, uri, config)

        assert.equal(r, "import file from '../../../src/folder1/file'")
    })
})
