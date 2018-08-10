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

You can specify a template that is used to create the new test. In the template you can add placeholders for the `moduleName` and the `modulePath` and `findPath`. While the first two are based on the module and used like simple placeholders, `findPath` gets a path string passed like this `${findPath('/test/utils/foo')}`.The passed path must be relative to the project root. The statment then will be replace by the path relative to the test file.

The default is

```
["import ${moduleName} from '${modulePath}'"]
```

But you set the to more complex like this:

```
[
    "import ${moduleName} from '${modulePath}'"
    "import testUtils from '${findPath('/test/utils/someModule')}'"
    "",
    "describe('${moduleName}', (){",
    "  it('', (){",
    "",
    "  })",
    "})"
]
```

The extension also supports multiple templates, by using on an object. When you use the extension it will show you the object keys to select a template:

```
{
    "simpleTemplate": [
        "import ${moduleName} from '${modulePath}'"
    ],
   "advancedTemplate": [
        "import ${moduleName} from '${modulePath}'",
        "",
        "describe('${moduleName}', ()=>{",
        "  it('', ()=>{",
        "",
        "  })",
        "})"
    ]
}
```

## Extension Settings

* `createTest.testFolder`: path to the test folder, if the string starts with `./` it will be search relative to the opened file, default is `"test"`
* `createTest.testFileExtension`: the file extension of the tests, default is `".spec.js"`
* `createTest.testFileTemplate`: the template for the new created test, default is `["import ${moduleName} from '${modulePath}'"]`
* `myExtension.srcFolder`: remove the source folder from the test file path

## Release Notes

### 1.1.0

Add multiple templates
Add `findPath` in templates

### 1.0.0

Initial release
