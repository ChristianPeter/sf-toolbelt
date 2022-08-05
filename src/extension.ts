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


		const editor = vscode.window.activeTextEditor;
		const selections = editor?.selections;

		if (selections == null || selections.length === 0) return undefined;

		return vscode.window.activeTextEditor?.edit(editBuilder => {
			for (let idx = 0; idx < selections.length; idx++) {
				const currentText = editor?.document.getText(selections[idx]) || '';
				const splitted = currentText.split('\n');
				let newContent = splitted
					.filter(row => row.trim().length > 0)
					.map(row => {
						return row.replace(/\'/gi, '\\\'');
					})
					.map(row => {
					return "'" + row + "' +";
				}).join('\n');

				newContent = newContent.substring(0, newContent.length-2);
				editBuilder.replace(selections[idx], newContent);
			}
			
		});
		
	});

	let disposable2 = vscode.commands.registerCommand('sftoolbelt.inConverter', () => {
		const editor = vscode.window.activeTextEditor;
		const selections = editor?.selections;
		const maxLen = 19000; // TODO: Make it a query box param
		
		if (selections == null || selections.length === 0) return undefined;

		return vscode.window.activeTextEditor?.edit(editBuilder => {
			for (let idx = 0; idx < selections.length; idx++) {
				const currentText = editor?.document.getText(selections[idx]) || '';
				const splitted = currentText.split('\n');

				const lenOfInput = currentText.length;
				const numberOfRows = splitted.length;
				const avgLineLen = numberOfRows > 0 ? lenOfInput / numberOfRows : 0;


				let cleanedUpRows = splitted
					.filter(row => row.trim().length > 0)
					.map(row => {
						return row.replace(/\'/gi, '\\\'');
					});

				// two cases: it's smaller than the max len, just join as one string
				let newContent = '';
				if (lenOfInput < maxLen) {
					newContent = "IN('" + cleanedUpRows.join("','") + "')";
				}
				// the len of input is greate than the max len of elements per IN, we have to split up and create multiple results
				else {
					const numberOfEntriesPerRow = avgLineLen > 0 ? 19000 / avgLineLen : 0;

					const results = [];
					let counter = 0;
					let itemCounter = 0;
					let currentLen = 0;
					let workArray = [];

					while (counter < splitted.length) {
						workArray[itemCounter] = splitted[counter];
						currentLen += 3 + workArray[itemCounter].length;
						itemCounter++;
						counter++;

						if (currentLen > maxLen) {
							results.push(workArray);
							workArray = [];
							itemCounter = 0;
							currentLen = 0;
						}
					}

					if (workArray.length >0)results.push(workArray);

					for (var i = 0; i < results.length; i++) {
						newContent += "IN('" + results[i].join("','") + "')" + "\n";
					}

				}

				editBuilder.replace(selections[idx], newContent);
			}
			
		});
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {}
