"use strict";

var SCOPES = [
    "TYPE_DECLARATION",
    "ABSTRACT_METHOD",
    "NON_ABSTRACT_METHOD",
    "CONTROL_FLOW",
    "ANNOTATION_ATTRIBUTE",
    "ANNOTATION_ARRAY_VALUE",
    "INITIALIZER"
];

var MODIFIERS = [
    "public",
    "protected",
    "private",
    "abstract",
    "static",
    "final",
    "transient",
    "volatile",
    "synchronized"
];

var INDENT = "  ";
var MAX_SINGLE_LINE_ATTRIBUTES = 3;
var TYPE_REGEX = new RegExp("(?:[\\w$]+\\.)*([\\w\\.*$]+)");

if (!String.format) {
    String.format = function(format, args) {
        var sprintf = function(match, number) {
            return number in args ? args[number] : match;
        };
        var sprintfRegex = /\{(\d+)\}/g;
        return format.replace(sprintfRegex, sprintf);
    };
}


function Writer() {
    var self = this;
    var isCompressingTypes = false;
    var packagePrefix = null;
    var scopes = [];
    var out = "";

    /*
     * Private methods
     */
    var indent = function() {
        for (var i = 0; i < scopes.length; i++) {
            out += INDENT;
        }
    };

    var hangingIndent = function() {
        for (var i = 0; i < scopes.length + 2; i++) {
            out += INDENT;
        }
    }

    /** Emits the modifiers to the writer. */
    var emitModifiers = function(modifiers) {
        if (typeof modifiers !== "undefined" && modifiers !== null) {
            for (var i = 0 ; i < MODIFIERS.length ; i++) {
                var modifier = MODIFIERS[i];
                if (modifiers.indexOf(modifier) >= 0) {
                    out += modifier + " ";
                }
            }
        }
    };

    var compressType = function(type) {
        /*var sb = "";
        if (packagePrefix === null) {
            throw new Error("IllegalState");
        }

        var pos = 0;
        var arr;
        while ((arr = TYPE_PATTERN.exec(str)) !== null) {
          var found = arr[0];

          // Copy non-matching characters like "<".
          var typeStart = found ? m.start() : type.length();
          sb.append(type, pos, typeStart);

          if (!found) {
            break;
          }

          // Copy a single class name, shortening it if possible.
          String name = m.group(0);
          String imported = importedTypes.get(name);
          if (imported != null) {
            sb.append(imported);
          } else if (isClassInPackage(name)) {
            String compressed = name.substring(packagePrefix.length());
            if (isAmbiguous(compressed)) {
              sb.append(name);
            } else {
              sb.append(compressed);
            }
          } else if (name.startsWith("java.lang.")) {
            sb.append(name.substring("java.lang.".length()));
          } else {
            sb.append(name);
          }
          pos = m.end();
        }
        return sb.toString();*/
        return type.split(".").pop();
    };

    var emitCompressedType = function(type) {
        if (isCompressingTypes) {
          out += compressType(type);
        } else {
          out += type;
        }
        return self;
    };

    var pushScope = function(pushed) {
        scopes.push(pushed);
    };

    var popScope = function(expected) {
        var popped = scopes.pop();
        if (typeof expected !== "undefined" && expected !== null) {
            if (popped !== expected) {
                throw new Error("IllegalStateException");
            }
        } else {
            return popped;
        }
    };

    var peekScope = function() {
        return scopes[scopes.length - 1];
    };

    var checkInMethod = function() {
        var scope = peekScope();
        if (scope !== "NON_ABSTRACT_METHOD" && scope !== "CONTROL_FLOW" && scope !== "INITIALIZER") {
          throw new Error("IllegalArgumentException");
        }
    };

    /** Emit a package declaration and empty line. */
    this.emitPackage = function(packageName) {
        if (packagePrefix != null) {
            throw new Error("IllegalStateException");
        }
        if (packageName === "") {
            packagePrefix = "";
        } else {
            out += "package " + packageName + ";\n\n";
            packagePrefix = packageName + ".";
        }
        return self;
    };

    this.beginType = function(type, kind, modifiers, extendsType, implementsTypes) {
        indent();
        emitModifiers(modifiers)
        out += kind;
        out += " ";
        emitCompressedType(type);
        if (extendsType != null) {
            out += " extends ";
            emitCompressedType(extendsType);
        }
        if (typeof implementsTypes === "Array" && implementsTypes.length > 0) {
            out += "\n";
            indent();
            out += "    implements ";
            for (var i = 0; i < implementsTypes.length; i++) {
                if (i != 0) {
                    out += ", ";
                }
                emitCompressedType(implementsTypes[i]);
            }
        }
        out += " {\n";
        pushScope("TYPE_DECLARATION");
        return self;
    };

    this.beginMethod = function(returnType, name, modifiers, parameters, throwsTypes) {
        indent();
        emitModifiers(modifiers);
        if (typeof returnType !== "undefined" && returnType !== null) {
            emitCompressedType(returnType);
            out += " ";
            out += name;
        } else {
            emitCompressedType(name);
        }
        out += "(";
        if (typeof parameters !== "undefined" && parameters !== null) {
            for (var p = 0; p < parameters.length;) {
                if (p != 0) {
                  out += ", ";
                }
                emitCompressedType(parameters[p++]);
                out += " ";
                emitCompressedType(parameters[p++]);
            }
        }
        out += ")";
        if (throwsTypes != null && throwsTypes.length > 0) {
            out += "\n";
            indent();
            out += "    throws ";
            for (var i = 0; i < throwsTypes.length; i++) {
                if (i != 0) {
                    out += ", ";
                }
                emitCompressedType(throwsTypes[i]);
            }
        }
        if (modifiers.indexOf("abstract") >= 0) {
            out += ";\n";
            pushScope("ABSTRACT_METHOD");
        } else {
            out += " {\n";
            pushScope("NON_ABSTRACT_METHOD");
        }
        return self;
    }

    this.beginControlFlow = function(controlFlow) {
        checkInMethod();
        indent();
        out += controlFlow;
        out += " {\n";
        pushScope("CONTROL_FLOW");
        return self;
    }

    this.nextControlFlow = function(controlFlow) {
        popScope("CONTROL_FLOW");
        indent();
        pushScope("CONTROL_FLOW");
        out += "} ";
        out += controlFlow;
        out += " {\n";
        return self;
    }

    this.endControlFlow = function(controlFlow) {
        popScope("CONTROL_FLOW");
        indent();
        if (typeof controlFlow !== "undefined" && controlFlow !== null) {
          out += "} ";
          out += controlFlow;
          out += ";\n";
        } else {
          out += "}\n";
        }
        return self;
    };

    /** Completes the current method declaration. */
    this.endMethod = function() {
        var popped = popScope();
        if (popped === "NON_ABSTRACT_METHOD") {
            indent();
            out += "}\n";
        } else if (popped != "ABSTRACT_METHOD") {
            throw new Error("IllegalStateException");
        }
        return self;
    }

    this.emitEnumValue = function(name) {
        indent();
        out += name;
        out += ",\n";
        return self;
    };

    this.emitField = function(type, name, modifiers, initialValue) {
        indent();
        emitModifiers(modifiers);
        emitCompressedType(type);
        out += " ";
        out += name;

        if (typeof initialValue !== "undefined" && initialValue != null) {
            out += " = ";
            out += initialValue;
        }
        out += ";\n";
        return self;
    };

    this.emitStatement = function(pattern) {
        checkInMethod();
        var args = Array.prototype.slice.call(arguments, 1);
        var lines = String.format(pattern, args).split("\n", -1);
        indent();
        out += lines[0];
        for (var i = 1; i < lines.length; i++) {
          out += "\n";
          hangingIndent();
          out += lines[i];
        }
        out += ";\n";
        return self;
    };

    this.emitSingleLineComment = function(comment) {
        var args = Array.prototype.slice.call(arguments, 1);
        indent();
        out += "// ";
        out += String.format(comment, args);
        out += "\n";
        return self;
    }

    this.emitImports = function() {
        for (var i = 0 ; i < arguments.length ; i++) {
            out += "import ";
            out += arguments[i];
            out += ";\n";
        }
        return self;
    }

    this.emitStaticImports = function() {
        for (var i = 0 ; i < arguments.length ; i++) {
            out += "import static ";
            out += arguments[i];
            out += ";\n";
        }
        return self;
    }

    this.endType = function() {
        popScope("TYPE_DECLARATION");
        indent();
        out += "}\n";
        return self;
    };

    this.toString = function() {
        return out;
    };
};

module.exports = Writer;
