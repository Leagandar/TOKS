const { app, BrowserWindow, ipcMain } = require("electron");
const SerialPort = require("serialport");
const path = require("path");
const url = require("url");

let inputInfoWindow,
	outputInfoWindow,
	statusWindow,
	COM3,
	COM4,
	baudRate = 57600;

const defaultWindowOptions = {
	resizable: false,
	autoHideMenuBar: true,
	webPreferences: {
		nodeIntegration: true,
	},
};

function createWindow() {
	outputInfoWindow = new BrowserWindow({
		width: 500,
		height: 300,
		x: 80,
		y: 400,
		resizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	statusWindow = new BrowserWindow({
		width: 650,
		height: 620,
		x: 600,
		y: 80,
		resizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	inputInfoWindow = new BrowserWindow({
		width: 500,
		height: 300,
		x: 80,
		y: 80,
		resizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	inputInfoWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "./screens/inputWindow.html"),
			protocol: "file:",
			slashes: true,
		})
	);

	outputInfoWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "./screens/outputWindow.html"),
			protocol: "file:",
			slashes: true,
		})
	);

	statusWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "./screens/statusWindow.html"),
			protocol: "file:",
			slashes: true,
		})
	);

	inputInfoWindow.on("closed", function () {
		inputInfoWindow = null;
		app.quit();
	});
	outputInfoWindow.on("closed", function () {
		outputInfoWindow = null;
	});
	statusWindow.on("closed", function () {
		statusWindow = null;
	});

	ipcMain.on("dataRec", onDataListener);
	ipcMain.on("comInitialization", onInitializationListener);
	ipcMain.on("Exit", onExitListener);
}

const onInitializationListener = (event, data) => {
	if (!COM3 || !COM4) {
		let today = new Date();
		let time =
			today.getHours() +
			":" +
			today.getMinutes() +
			":" +
			today.getSeconds();
		COM3 = new SerialPort("COM3", { baudRate: 57600 }, (error) => {
			if (error) {
				statusWindow.webContents.send(
					"status",
					`[${time}] [COM3] Initialization failed with the following error: ${error.message}`
				);
				COM3 = null;
			} else {
				statusWindow.webContents.send(
					"status",
					`[${time}] [COM3] Initialization... OK. Opening... OK. Baud Rate: ${baudRate}`
				);
			}
		});
		COM4 = new SerialPort("COM4", { baudRate: 57600 }, (error) => {
			if (error) {
				statusWindow.webContents.send(
					"status",
					`[${time}] [COM4] Initialization failed with the following error: ${error.message}`
				);
				COM4 = null;
			} else {
				statusWindow.webContents.send(
					"status",
					`[${time}] [COM4] Initialization... OK. Opening... OK. Baud Rate: ${baudRate}`
				);
			}
		});
	}
};

const onDataListener = (event, arg) => {
	let today = new Date();
	let time =
		today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	if (COM3) {
		COM3.write(arg, function (error) {
			if (error) {
				statusWindow.webContents.send(
					"status",
					`[${time}] [COM3] Failed on writing data: ${error.message}`
				);
			} else {
				if (statusWindow) {
					statusWindow.webContents.send(
						"status",
						`[${time}] [COM3] Successfully written data, number of written bytes: ${
							new Buffer(arg).length
						}`
					);
				}
			}
		});
	}
	if (COM4) {
		COM4.on("data", function (data) {
			if (statusWindow) {
				statusWindow.webContents.send(
					"status",
					`[${time}] [COM4] Successfully received data, number of received bytes: ${data.length}`
				);
			}
			outputInfoWindow.webContents.send("outputReply", data.toString());
			COM4.removeAllListeners();
		});
	}
};

const onExitListener = (event, arg) => {
	app.quit();
};

app.on("ready", createWindow);

app.on("window-all-closed", function () {
	app.quit();
});
