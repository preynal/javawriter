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
var INDENT = "  ";
var MAX_SINGLE_LINE_ATTRIBUTES = 3;
var TYPE_REGEX = new RegExp("(?:[\\w$]+\\.)*([\\w\\.*$]+)");

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

    /** Emits the modifiers to the writer. */
    var emitModifiers = function(modifiers) {
        if (typeof modifiers !== "undefined" && modifiers !== null) {
            for (var i = 0 ; i < modifiers.length ; i++) {
                out += modifiers[i] + " ";
            }
        }
    };

    /*var compressType = function(type) {
        var sb = "";
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
        return sb.toString();
    };*/

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
        if (scopes.pop() !== expected) {
            throw new Error("IllegalStateException");
        }
    };

    // body
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
