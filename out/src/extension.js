'use strict';
var vscode = require('vscode');
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
        if (fileExt !== "js") {
            return vscode.window.showInformationMessage("Evaljs: This file is not a js file.");
        }
        if (!activeEditor.selections.length) {
            return;
        }
        var selection = activeEditor.selections[0];
        var text = activeEditor.document.getText(selection);
        var result = "";
        try {
            result = eval(text);
        }
        catch (error) {
            result = error.toString();
        }
        if (result === undefined) {
            vscode.window.showInputBox({ prompt: 'Please input your arguments.' }).then(function (args) {
                text = "(" + text + ")(" + args + ")";
                try {
                    result = eval(text);
                }
                catch (error) {
                    result = error.toString();
                }
                showOutput(result);
            });
        }
        else {
            showOutput(result);
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
//# sourceMappingURL=extension.js.map