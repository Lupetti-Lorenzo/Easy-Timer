import * as vscode from "vscode";
     
export class Timer {
	public timerStates = Object.freeze({
		play: "PLAY",
		stop: "STOP",
		save: "SAVE",
	});
	private currentState: string = this.timerStates.save;
	private currentTime: number = 0; //current time in seconds
	private intervalID: any;

	private timerStatusBarItem: vscode.StatusBarItem;
	private timerStatusBarIcon: string;
	private statusBarSpinningIcon: string;

	constructor(timerStatusBarItem: vscode.StatusBarItem, timerStatusBarIcon: string) {
		this.timerStatusBarItem = timerStatusBarItem;
		this.timerStatusBarIcon = `$(${timerStatusBarIcon})`;
		this.statusBarSpinningIcon = `$(${timerStatusBarIcon}~spin)`;
	}

	public stop() {
		//clear the interval
		this.currentState = this.timerStates.stop;
		clearInterval(this.intervalID);
		this.intervalID = undefined;
		this.updateText();
	}

	public play() {
		this.currentState = this.timerStates.play;
		//display starting text
		this.updateText(this.statusBarSpinningIcon);
		//set interval that handle the timer
		this.intervalID = setInterval(() => {
			this.currentTime++;
			if (this.currentTime % 60 === 0) {
				//reload every minute
				this.updateText(this.statusBarSpinningIcon);
			}
		}, 1000);
	}

	public save() {
		this.currentState = this.timerStates.save;
		//clear the interval and default current time
		clearInterval(this.intervalID);
		this.intervalID = undefined;
		this.currentTime = 0;
		this.timerStatusBarItem.text = "";
	}

	public secToTime(totalSecs: number, showAll: boolean = this.currentState === this.timerStates.stop) {
		// hh:mm ---> `${new Date(sec * 1000).toISOString().substr(11, 5)}`
		const hours = Math.floor(totalSecs / 3600);
		const minutes = Math.floor((totalSecs % 3600) / 60);
		const seconds = Math.floor(totalSecs % 60);
		return `${hours > 0 || showAll ? `${hours}h ` : ""}${minutes}min${showAll ? ` ${seconds}sec` : ""}`;
	}

	public updateText(icon: string = this.timerStatusBarIcon) {
		this.timerStatusBarItem.text = `${icon} ${this.secToTime(this.currentTime)}`;
	}

	public getCurrentTime() {
		return this.currentTime;
	}
	public getCurrentState() {
		return this.currentState;
	}
}
