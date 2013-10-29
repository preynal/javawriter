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
            //+ "public final class Foo {\n"
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
            //+ "public enum Foo {\n"
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
            //+ "class Foo {\n"
            + "class com.squareup.Foo {\n"
            //+ "  private static String string;\n"
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
            //+ "class Foo {\n"
            + "class com.squareup.Foo {\n"
            //+ "  String string = \"bar\" + \"baz\";\n"
            + "  java.lang.String string = \"bar\" + \"baz\";\n"
            + "}\n");
    });

    /*it("abstractMethodDeclaration", function() {
        writer.emitPackage("com.squareup");
        writer.beginType("com.squareup.Foo", "class");
        writer.beginMethod("java.lang.String", "foo", ["abstract", "public"],
            "java.lang.Object", "object", "java.lang.String", "s");
        writer.endMethod();
        writer.endType();
        assertCode(""
            + "package com.squareup;\n"
            + "\n"
            + "class Foo {\n"
            + "  public abstract String foo(Object object, String s);\n"
            + "}\n");
    });*/

});


