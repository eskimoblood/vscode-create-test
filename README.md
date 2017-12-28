# VS-Code Create Test Extension

This extension will open the coresponding test file for the opened source file. If the file not exists, it will create a new one.

## Features

The extension support two patterns to organize your tests, either in a `test` folder add the root of the project or in a `test` folder relative to the actual file. For creating a new file you can add a template.

### Test folder in root

I assume that the test are organized in the same way as the source folder. So if you open a file in `/src/foo/bar.js` the extension will create a test in `/test/src/foo/bar.spec.js`.

If you dont want the `src` folder beeing part of the path for the new file you can set the `srcFolder` setting to `src` (have a look the settings part). This would create the file in `/test/foo/bar.spec.js`.

### Test folder relative to the file

To enable this kind of path creation you need to set `testFolder` setting to a string starting with `./`. In the example the setting is `./test`. So if you open a file in `/src/foo/bar.js` the extension will create a test in `/src/foo/test/bar.spec.js`.

### Test file template

You can specify a template that is used to create the new test. In the template you can add placeholders for the `moduleName` and the `modulePath`. The default is

```
["import ${moduleName} from '${modulePath}'"]
```

But you set the to more complex like this:

```
[
    "import ${moduleName} from '${modulePath}'"
    "",
    "describe('${moduleName}', (){",
    "  it('', (){",
    "",
    "  })",
    "})"
]
```

## Extension Settings

* `createTest.testFolder`: path to the test folder, if the string starts with `./` it will be search relative to the opened file, default is `"test"`
* `myExtension.testFileExtension`: the file extension of the tests, default is `".spec.js"`
* `myExtension.testFileTemplate`: the template for the new created test, default is `["import ${moduleName} from '${modulePath}'"]`
* `myExtension.srcFolder`: remove the source folder from the test file path

## Release Notes

### 1.0.0

Initial release
