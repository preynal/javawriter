"use strict";
var assert = require("assert");
var expect = require("expect.js");
var JavaWriter = require("../javawriter");

describe("JavaWriter test", function() {
    var writer;
    beforeEach(function() {
        writer = new JavaWriter();
    });

    var assertCode = function (code) {
        expect(writer.toString()).to.equal(code);
    }

    it("typeDeclaration", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class", ["public", "final"]);
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "public final class com.squareup.Foo {\n"
            + "}\n");
    });

    it("enumDeclaration", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "enum", ["public"]);
        writer.emitEnumValue("BAR");
        writer.emitEnumValue("BAZ");
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "public enum com.squareup.Foo {\n"
            + "  BAR,\n"
            + "  BAZ,\n"
            + "}\n");
    });

    it("fieldDeclaration", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.emitField("java.lang.String", "string", ["private", "static"]);
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  private static java.lang.String string;\n"
            + "}\n");
    });

    it("fieldDeclarationWithInitialValue", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.emitField("java.lang.String", "string", [], "\"bar\" + \"baz\"");
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  java.lang.String string = \"bar\" + \"baz\";\n"
            + "}\n");
    });

    it("abstractMethodDeclaration", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("java.lang.String", "foo", ["abstract", "public"],
            ["java.lang.Object", "object", "java.lang.String", "s"]);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  public abstract java.lang.String foo(java.lang.Object object, java.lang.String s);\n"
            + "}\n");
    });

    it("abstractMethodDeclarationWithThrows", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("java.lang.String", "foo", ["abstract", "public"],
            ["java.lang.Object", "object", "java.lang.String", "s"],
            ["java.io.IOException"]);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  public abstract java.lang.String foo(java.lang.Object object, java.lang.String s)\n"
            + "      throws java.io.IOException;\n"
            + "}\n");
    });

    it("nonAbstractMethodDeclaration", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("int", "foo", [], ["java.lang.String", "s"]);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  int foo(java.lang.String s) {\n"
            + "  }\n"
            + "}\n");
    });

    it("nonAbstractMethodDeclarationWithThrows", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("int", "foo", [],
            ["java.lang.String", "s"], ["java.io.IOException"]);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  int foo(java.lang.String s)\n"
            + "      throws java.io.IOException {\n"
            + "  }\n"
            + "}\n");
    });

    it("constructorDeclaration", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod(null, "com.squareup.Foo", "public", ["java.lang.String", "s"]);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  public com.squareup.Foo(java.lang.String s) {\n"
            + "  }\n"
            + "}\n");
    });

    it("constructorDeclarationWithThrows", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod(null, "com.squareup.Foo", "public",
            ["java.lang.String", "s"], ["java.io.IOException"]);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  public com.squareup.Foo(java.lang.String s)\n"
            + "      throws java.io.IOException {\n"
            + "  }\n"
            + "}\n");
    });

    it("statement", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("int", "foo", [], ["java.lang.String", "s"]);
        writer.emitStatement("int j = s.length() + {0}", 13);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  int foo(java.lang.String s) {\n"
            + "    int j = s.length() + 13;\n"
            + "  }\n"
            + "}\n");
    });

    it("statementPrecededByComment", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("int", "foo", [], ["java.lang.String", "s"]);
        writer.emitSingleLineComment("foo");
        writer.emitStatement("int j = s.length() + {0}", 13);
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  int foo(java.lang.String s) {\n"
            + "    // foo\n"
            + "    int j = s.length() + 13;\n"
            + "  }\n"
            + "}\n");
    });

    it("multiLineStatement", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Triangle", "class");
        writer.beginMethod("double", "pythagorean", [],
            ["int", "a", "int", "b"]);
        writer.emitStatement("int cSquared = a * a\n+ b * b");
        writer.emitStatement("return Math.sqrt(cSquared)");
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Triangle {\n"
            + "  double pythagorean(int a, int b) {\n"
            + "    int cSquared = a * a\n"
            + "        + b * b;\n"
            + "    return Math.sqrt(cSquared);\n"
            + "  }\n"
            + "}\n");
    });

    it("addImport", function() {
        writer.emitPackage("com.squareup");
        writer.emitImports("java.util.ArrayList");
        writer.beginType("com.squareup.Foo", "class", ["public", "final"]);
        writer.emitField("java.util.ArrayList", "list", [], "new java.util.ArrayList()");
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "import java.util.ArrayList;\n"
            + "public final class com.squareup.Foo {\n"
            + "  java.util.ArrayList list = new java.util.ArrayList();\n"
            + "}\n");
    });

    it("addStaticImport", function() {
        writer.emitPackage("com.squareup");
        writer.emitStaticImports("java.lang.System.getProperty");
        writer.beginType("com.squareup.Foo", "class", ["public", "final"]);
        writer.emitField("String", "bar", [], "getProperty(\"bar\")");
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "import static java.lang.System.getProperty;\n"
            + "public final class com.squareup.Foo {\n"
            + "  String bar = getProperty(\"bar\");\n"
            + "}\n");
    });

    it("addStaticWildcardImport", function() {
        writer.emitPackage("com.squareup");
        writer.emitStaticImports("java.lang.System.*");
        writer.beginType("com.squareup.Foo", "class", ["public", "final"]);
        writer.emitField("String", "bar", [], "getProperty(\"bar\")");
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "import static java.lang.System.*;\n"
            + "public final class com.squareup.Foo {\n"
            + "  String bar = getProperty(\"bar\");\n"
            + "}\n");
    });

    it("emptyImports", function() {
        writer.emitPackage("com.squareup");
        writer.emitImports();
        writer.beginType("com.squareup.Foo", "class", ["public", "final"]);
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "public final class com.squareup.Foo {\n"
            + "}\n");
    });

    it("emptyStaticImports", function() {
        writer.emitPackage("com.squareup");
        writer.emitStaticImports();
        writer.beginType("com.squareup.Foo", "class", ["public", "final"]);
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "public final class com.squareup.Foo {\n"
            + "}\n");
    });

    it("addImportFromSubpackage", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class", ["public", "final"]);
        writer.emitField("com.squareup.bar.Baz", "baz");
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "public final class com.squareup.Foo {\n"
            + "  com.squareup.bar.Baz baz;\n"
            + "}\n");
    });

    it("ifControlFlow", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("int", "foo", [], ["java.lang.String", "s"]);
        writer.beginControlFlow("if (s.isEmpty())");
        writer.emitStatement("int j = s.length() + {0}", 13);
        writer.endControlFlow();
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  int foo(java.lang.String s) {\n"
            + "    if (s.isEmpty()) {\n"
            + "      int j = s.length() + 13;\n"
            + "    }\n"
            + "  }\n"
            + "}\n");
    });

    it("doWhileControlFlow", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("int", "foo", [], ["java.lang.String", "s"]);
        writer.beginControlFlow("do");
        writer.emitStatement("int j = s.length() + {0}", 13);
        writer.endControlFlow("while (s.isEmpty())");
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  int foo(java.lang.String s) {\n"
            + "    do {\n"
            + "      int j = s.length() + 13;\n"
            + "    } while (s.isEmpty());\n"
            + "  }\n"
            + "}\n");
    });

    it("tryCatchFinallyControlFlow", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("int", "foo", [], ["java.lang.String", "s"]);
        writer.beginControlFlow("try");
        writer.emitStatement("int j = s.length() + {0}", 13);
        writer.nextControlFlow("catch (RuntimeException e)");
        writer.emitStatement("e.printStackTrace()");
        writer.nextControlFlow("finally");
        writer.emitStatement("int k = {0}", 13);
        writer.endControlFlow();
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class com.squareup.Foo {\n"
            + "  int foo(java.lang.String s) {\n"
            + "    try {\n"
            + "      int j = s.length() + 13;\n"
            + "    } catch (RuntimeException e) {\n"
            + "      e.printStackTrace();\n"
            + "    } finally {\n"
            + "      int k = 13;\n"
            + "    }\n"
            + "  }\n"
            + "}\n");
    });

    /*it("annotatedType", function() {
        writer.emitPackage("com.squareup");
        writer.emitImports("javax.inject.Singleton");
        writer.emitAnnotation("javax.inject.Singleton");
        writer.emitAnnotation(SuppressWarnings.class,
            JavaWriter.stringLiteral("unchecked"));
        writer.beginType("com.squareup.Foo", "class");
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "import javax.inject.Singleton;\n"
            + "@Singleton\n"
            + "@SuppressWarnings(\"unchecked\")\n"
            + "class Foo {\n"
            + "}\n");
    });

    it("emptyImports", function() {

    });*/

});


