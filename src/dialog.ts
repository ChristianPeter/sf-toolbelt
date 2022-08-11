import * as vscode from 'vscode';
import { window } from 'vscode';


/**
 * Shows an input box using window.showInputBox().
 */
 export async function showInputBox() {
	const cfg = {
		"prefix" : "IN(",
		"suffix" : ")",
		"seperator" : ",",
		"quote" : "'"
	};
	const result = await window.showInputBox({
		value: JSON.stringify(cfg, null, 2),
		placeHolder: JSON.stringify(cfg, null, 2)
		
	});


	return result; //window.showInformationMessage(`Got: ${result}`);
}