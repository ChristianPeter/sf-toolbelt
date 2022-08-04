// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "sftoolbelt" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('sftoolbelt.toApexString', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const editor = vscode.window.activeTextEditor;

		if (editor && editor?.selections.length > 0){ 
			const selections = editor.selections;
			const selectedText = editor?.document.getText(editor.selection) as string;

			const splitted = selectedText.split('\n');

			let newContent = splitted
				.filter(row => row.trim().length > 0)
				.map(row => {
					return row.replace('\'', '\\\'');
				})
				.map(row => {
				return "'" + row + "' +";
			}).join('\n');

			newContent = newContent.substring(0, newContent.length-2);

			vscode.window.activeTextEditor?.edit(editBuilder => {
				editBuilder.replace(selections[0], newContent);
			});
		}
		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
