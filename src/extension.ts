'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.eval', () => {
        let activeEditor;
        let document;
        try {
            activeEditor = vscode.window.activeTextEditor;
            document = activeEditor.document;
            if (!activeEditor || !document) {
                throw new Error("");
            }
        } catch (error) {
            return vscode.window.showInformationMessage("Evaljs can't get the file information! Please use in a file content.");
        }
        const fileExt = document.isUntitled ? '' : document.fileName.split('.').pop().toLowerCase();
        if (fileExt !== "js") {
            return vscode.window.showInformationMessage("Evaljs: This file is not a js file.");
        }
        if (!activeEditor.selections.length) {
            return;
        }

        let selection = activeEditor.selections[0];
        let text = activeEditor.document.getText(selection);
        let result = "";
        try {
            result = eval(text);
        } catch (error) {
            result = error.toString();
        }

        if (result === undefined) {
            vscode.window.showInputBox({prompt: 'Please input your arguments.'}).then(args => {
                text = `(${text})(${args})`;
                try {
                    result = eval(text);
                } catch (error) {
                    result = error.toString();
                }
                showOutput(result);
            });
        } else {
            showOutput(result);
        }
    });

    context.subscriptions.push(disposable);
}

function showOutput(result) {
    const outputChannel = vscode.window.createOutputChannel("evaljs");
    outputChannel.show(false);
    outputChannel.appendLine(result);
}
