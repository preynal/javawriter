JavaWriter
==========

[![Build Status](https://travis-ci.org/preynal/javawriter.png?branch=master)](https://travis-ci.org/preynal/javawriter)

A utility module to generate Java source files. Ported from Square's JavaWriter.

`JavaWriter` is a utility module which aids in generating Java source files.

Source file generation can useful when doing things such as annotation processing or interacting
with metadata files (e.g., database schemas, protocol formats). By generating code, you eliminate
the need to write boilerplate while also keeping a single source of truth for the metadata.



Example
-------

```js
var Writer = require("javawriter");
new Writer().emitPackage("com.example")
    .beginType("com.example.Person", "class", ["public", "final"])
    .emitField("String", "firstName", ["private"])
    .emitField("String", "lastName", ["private"])
    .emitJavadoc("Returns the person's full name.")
    .beginMethod("String", "getName", ["public"])
    .emitStatement("return firstName + \" \" + lastName")
    .endMethod()
    .endType();
```

Would produce the following source output:

```java
package com.example;

public final class Person {
  private String firstName;
  private String lastName;
  /**
   * Returns the person's full name.
   */
  public String getName() {
    return firstName + " " + lastName;
  }
}
```



Download
--------

Via Git:
```shell
git clone git@github.com:preynal/javawriter.git
```

Or via NPM:

```shell
npm install javawriter
```


License
-------

    Copyright 2013 Square, Inc.
    Copyright 2013 Philippe de Reynal.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
