'use strict';
var vscode = require('vscode');
var CodeTypeRegExp = {
    anonymousFunction: /^(function\s*\([\s\S]*\)\s*{[\s\S]*})[;\s]*/,
    normalFunction: /^(function\s+[a-zA-Z0-9]+\s*\([\s\S]*\)\s*{[\s\S]*})[;\s]*/,
    closureFunction: /function\s*[a-zA-Z0-9]*\s*\([\s\S]*\)\s*{[\s\S]*}/
};
function activate(context) {
    var disposable = vscode.commands.registerCommand('extension.eval', function () {
        var activeEditor;
        var document;
        try {
            activeEditor = vscode.window.activeTextEditor;
            document = activeEditor.document;
            if (!activeEditor || !document) {
                throw new Error("");
            }
        }
        catch (error) {
            return vscode.window.showInformationMessage("Evaljs can't get the file information! Please use in a file content.");
        }
        var fileExt = document.isUntitled ? '' : document.fileName.split('.').pop().toLowerCase();
        if (isFileExtIllegal(fileExt)) {
            return vscode.window.showInformationMessage("Evaljs: This file is not a js file.");
        }
        if (!activeEditor.selections.length) {
            return;
        }
        var selection = activeEditor.selections[0];
        var text = activeEditor.document.getText(selection);
        var result;
        var isBeautify = vscode.workspace.getConfiguration('eval').get('beautifyObject');
        if (CodeTypeRegExp.anonymousFunction.test(text)) {
            vscode.window.showInputBox({ prompt: 'Please input your arguments.' }).then(function (args) {
                text = text.replace(CodeTypeRegExp.anonymousFunction, function (all, match) {
                    return match;
                });
                text = "(" + text + ")(" + args + ")";
                result = cal(text, isBeautify);
                showOutput(result);
            });
        }
        else if (CodeTypeRegExp.normalFunction.test(text)) {
            text = text.replace(CodeTypeRegExp.normalFunction, function (all, match) {
                return match;
            });
            result = cal(text, isBeautify);
            if (result === undefined) {
                vscode.window.showInputBox({ prompt: 'Please input your arguments.' }).then(function (args) {
                    text = "(" + text + ")(" + args + ")";
                    result = cal(text, isBeautify);
                    showOutput(result);
                });
            }
            else {
                showOutput(result);
            }
        }
        else if (CodeTypeRegExp.closureFunction.test(text)) {
            result = cal(text, isBeautify);
            showOutput(result);
        }
        else {
            result = cal(text, isBeautify);
            if (typeof result === "number" && vscode.workspace.getConfiguration('eval').get('replaceNumberFormula')) {
                activeEditor.edit(function (editor) {
                    editor.replace(new vscode.Range(selection.start, selection.end), '' + result);
                });
            }
            else {
                showOutput(result);
            }
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function showOutput(result) {
    var outputChannel = vscode.window.createOutputChannel("evaljs");
    outputChannel.show(false);
    outputChannel.appendLine(result);
}
function isFileExtIllegal(fileExt) {
    switch (fileExt) {
        case "js":
        case "ts":
        case "jsx":
        case "es":
            return false;
        default:
            return true;
    }
}
function cal(text, isBeauty) {
    var result;
    try {
        result = eval(text);
    }
    catch (error) {
        result = error.toString();
    }
    if (Object.prototype.toString.call(result) === "[object Object]") {
        var editor = void 0, tabSize = void 0;
        tabSize = (editor = vscode.window.activeTextEditor) ? editor.options.tabSize : 4;
        result = JSON.stringify(result, null, isBeauty ? tabSize : 0);
    }
    return result;
}
//# sourceMappingURL=extension.js.map