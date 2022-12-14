// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { transcode } from 'any-json-no-cson';
import {showInputBox} from './dialog';

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


	let disposable3 = vscode.commands.registerCommand('sftoolbelt.sortCustomLabels', () => {
		const editor = vscode.window.activeTextEditor;
		const selections = editor?.selections;

		if (selections == null || selections.length === 0) return undefined;

		return vscode.window.activeTextEditor?.edit(editBuilder => {
			for (let idx = 0; idx < selections.length; idx++) {
				const currentText = editor?.document.getText(selections[idx]) || '';

				if (currentText) {
					transcode(currentText, 'xml', 'json').then(data => {
						const d = JSON.parse(data) as any;						
						d.CustomLabels.labels.sort((a: any,b: any) => {
							const aa = a.fullName[0] as string;
							const bb = b.fullName[0] as string;
							return aa.localeCompare(bb);
						});
						
						transcode(JSON.stringify(d), 'json', 'xml').then(data1 => {
							const newContent = data1.replace('standalone="yes"', '');
							vscode.window.activeTextEditor?.edit(editBuilder => {
								editBuilder.replace(selections[idx], newContent);
							});
						});
					});
				}
			}
		});
	});

	let disposable4 = vscode.commands.registerCommand('sftoolbelt.customConverter', () => {
		const editor = vscode.window.activeTextEditor;
		const selections = editor?.selections;

		if (selections == null || selections.length === 0) return undefined;


		let result = showInputBox();

		result.then((data) => {
			vscode.window.showInformationMessage(`Got: ${data}`);
			const cfg = JSON.parse(data || '{}');

			vscode.window.activeTextEditor?.edit(editBuilder => {
				for (let idx = 0; idx < selections.length; idx++) {
					const currentText = editor?.document.getText(selections[idx]) || '';
					const splitted = currentText.split('\n');

					let cleanedUpRows = splitted
						.filter(row => row.trim().length > 0)
						.map(row => {
							return row.replace(/\'/gi, '\\\'');
						});

					let newContent = cfg.prefix + cfg.quote + cleanedUpRows.join(cfg.quote + cfg.seperator + cfg.quote) + cfg.quote + cfg.suffix;

					editBuilder.replace(selections[idx], newContent);
				}
				
			});
		});
		
	});

	let disposable5 = vscode.commands.registerCommand('sftoolbelt.addBackslashLinebreak', () => {


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
					return row + "\\";
				}).join('\n');

				newContent = newContent.substring(0, newContent.length-2);
				editBuilder.replace(selections[idx], newContent);
			}
			
		});
		
	});

	// 
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	context.subscriptions.push(disposable5);
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
