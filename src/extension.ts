import * as vscode from "vscode";
import { Timer } from "./Timer";

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration("easytimer");
	if (config.active === true) {
		//status bar items and command IDs
		const playStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
		const playTimerCommandId = "easytimer.startTimer";
		const stopStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
		const stopTimerCommandId = "easytimer.stopTimer";
		const saveStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
		const saveTimerCommandId = "easytimer.saveTimer";

		//timer
		const timerStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
		const timerStatusBarIcon: string = `extensions-sync-enabled`;
		const timer = new Timer(timerStatusBarItem, timerStatusBarIcon);

		let sessionDate: Date = new Date(2000, 1, 0);

		//enroll status bar items command
		subscriptions.push(
			vscode.commands.registerCommand(playTimerCommandId, () => {
				timer.play();
				playStatusBarItem.hide();
				stopStatusBarItem.show();
				saveStatusBarItem.show();
				if (sessionDate.getFullYear() === 2000) {
					//first time pressing start, set the date of the session
					sessionDate = new Date();
				}
			}),

			vscode.commands.registerCommand(stopTimerCommandId, () => {
				timer.stop();
				playStatusBarItem.show();
				stopStatusBarItem.hide();
			}),

			vscode.commands.registerCommand(saveTimerCommandId, async () => {
				const sessionSeconds: number = timer.getCurrentTime();
				const prevTimerState: string = timer.getCurrentState(); //if the user click x or continue session set the timer to the previous state.

				//stop the timer while the user is choosing
				if (prevTimerState === timer.timerStates.play) {
					timer.stop();
					stopStatusBarItem.hide();
				} else {
					playStatusBarItem.hide();
				}
				saveStatusBarItem.hide();
				timer.updateText("Closing...");

				//message to continue or stop the session
				const response = await vscode.window.showErrorMessage(
					`Continue the session? Date: ${sessionDate.getUTCFullYear()}/${
						sessionDate.getUTCMonth() + 1
					}/${sessionDate.getUTCDate()} ${sessionDate.getHours()}:${sessionDate.getMinutes()} Time: ${timer.secToTime(
						sessionSeconds,
						true,
					)}`,
					"Continue",
					"Finish",
				);

				if (response === "Finish") {
					//default session data
					timer.save();
					playStatusBarItem.show();
					timerStatusBarItem.text = "";
					sessionDate = new Date(2000, 1, 0);
				} else {
					//the user clicked x or continue session
					if (prevTimerState === timer.timerStates.play) {
						timer.play();
						stopStatusBarItem.show();
					} else {
						timer.updateText(`$(${timerStatusBarIcon})`);
						playStatusBarItem.show();
					}
					saveStatusBarItem.show();
				}
			}),
		);

		//PLAY StatusBarItem
		playStatusBarItem.command = playTimerCommandId;
		playStatusBarItem.text = `$(notebook-execute)`;
		playStatusBarItem.color = "LightSkyBlue";
		playStatusBarItem.show();
		subscriptions.push(playStatusBarItem);

		//STOP StatusBarItem
		stopStatusBarItem.command = stopTimerCommandId;
		stopStatusBarItem.text = `$(debug-pause)`;
		subscriptions.push(stopStatusBarItem);

		//SAVE StatusBarItem
		saveStatusBarItem.command = saveTimerCommandId;
		saveStatusBarItem.text = `$(debug-stop)`;
		subscriptions.push(saveStatusBarItem);

		//TIMER StatusBarItem
		timerStatusBarItem.show();
		subscriptions.push(timerStatusBarItem);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
