// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const tiny = require('./tiny');
const AxiosCancelToken = axios.CancelToken;
const axiosSource = AxiosCancelToken.source();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function getFileNameFromLocalFilePath(filePath) {
	const arr = filePath.split('/');
	if(!arr || !arr.length) {
		return '';
	}
	return arr[arr.length - 1];
}

function getCurrentFileType() {
	if(vscode.window.activeTextEditor) {
		return vscode.window.activeTextEditor.document.languageId
	}
	return '';
}

function isMarkdownFile() {
	return getCurrentFileType() === 'markdown';
}

async function uploadImage(uploadUrl, filePath, useTinyPNG) {
	const form = new FormData();

	if(useTinyPNG) {
		try {
			filePath = await tiny.compress2(filePath);
		} catch(e) {
			vscode.window.showErrorMessage(`upload here error: ${tiny.handleError(e)}`);
			return;
		}
	}

	form.append('file', fs.createReadStream(filePath));

	vscode.window.withProgress({
		cancellable: true,
		title: '正在上传...',
		location: vscode.ProgressLocation.Notification
	}, (progress, token) => {
		token.onCancellationRequested(() => {
			axiosSource.cancel();
		});
		return new Promise((resolve, reject) => {
			axios.post(uploadUrl, form, { 
				headers: form.getHeaders(),
				cancelToken: axiosSource.token 
			})
			.then((response) => {
				if(response.data && response.data.data && response.data.data.url) {
					const imageUrl = response.data.data.url;
					vscode.env.clipboard.writeText(imageUrl);
					const snippet = isMarkdownFile() ? 
						`![${getFileNameFromLocalFilePath(filePath)}](${imageUrl})` : imageUrl;
					vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(snippet));
				} else {
					vscode.window.showErrorMessage('上传失败，请重试');
				}
				useTinyPNG && tiny.removeFileFromDisk(filePath);
				resolve();
			}).
			catch((thrown) => {
				console.log(thrown);
				if (axios.isCancel(thrown)) {
					console.log('Request canceled', thrown.message);
				} else {
					vscode.window.showErrorMessage('上传失败，请重试');
				}
				useTinyPNG && tiny.removeFileFromDisk(filePath);
				reject();
			})
		})
	});
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "upload-here" is now active!');

	// 读取编辑器配置
	const uploadHereConfig = vscode.workspace.getConfiguration('upload here');
	const uploadUrl = uploadHereConfig.uploadUrl;

	if(!uploadUrl) {
		vscode.window.showErrorMessage('请先配置图片上传接口地址');
		return;
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('upload-here.UploadHere', function () {
		// The code you place here will be executed every time your command is executed

		vscode.window.showOpenDialog({
			canSelectFolders: false,
			canSelectMany: false,
			filters: {
				'Images': ['png', 'jpg', 'ico', 'jpeg', 'svg', 'gif']
			}
		}).then(async (fileUri) => {
			if (fileUri && fileUri[0]) {
				let config = vscode.workspace.getConfiguration('upload here');
				let useTinyPNG = config.tinyPNGKey && config.useTinyPNG;
				const filePath = fileUri[0].fsPath;
				const ext = path.extname(filePath);
				// png jpg 图片才进行压缩
				if(ext !== '.png' && ext !== '.jpg' && ext !== 'jpeg') {
					useTinyPNG = false;
				}

				if(useTinyPNG) {
					tiny.initTiny(uploadHereConfig.tinyPNGKey);
					// const validateTiny = await tiny.validateTinyKey();
					// if(!validateTiny) {
					// 	vscode.window.showErrorMessage('请输入有效的 tinyPNG Key');
					// 	return;
					// }
				}
				uploadImage(uploadUrl, filePath, useTinyPNG);
			}
		});
	});

	context.subscriptions.push(disposable);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
