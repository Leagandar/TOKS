const { app, BrowserWindow, ipcMain } = require("electron");
const SerialPort = require("serialport");
const path = require("path");
const url = require("url");

// var 19
let inputInfoWindow,
	outputInfoWindow,
	statusWindow,
	isInitialized = false,
	baudRate = 57600,
	flag = "77", // 119
	ESCSymbol = "75", //117
	encodeSymbol = "57", // 87
	ESCEncodeSymbol = "65"; //101

//wdsf

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
		...defaultWindowOptions,
	});
	statusWindow = new BrowserWindow({
		width: 650,
		height: 620,
		x: 600,
		y: 80,
		...defaultWindowOptions,
	});
	inputInfoWindow = new BrowserWindow({
		width: 500,
		height: 300,
		x: 80,
		y: 80,
		...defaultWindowOptions,
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

	ipcMain.on("data", onDataListener);
	ipcMain.on("Initialization", onInitializationListener);
	ipcMain.on("Exit", onExitListener);
}

const onInitializationListener = (event, data) => {
	if (!isInitialized) {
		let today = new Date();
		let time =
			today.getHours() +
			":" +
			today.getMinutes() +
			":" +
			today.getSeconds();
		if (statusWindow) {
			statusWindow.webContents.send(
				"status",
				`[${time}] Stuffing Flag: ${flag}.`
			);
		}
	}
};

const onDataListener = (event, arg) => {
	let today = new Date();
	let time =
		today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

	sourceData = arg.toString();

	let hexData = "";
	for (let i = 0; i < sourceData.length; i++) {
		hexData += sourceData[i].charCodeAt(0).toString(16) + " ";
	}

	let stuffedData = byteStuffing(hexData);

	let deStuffedData = byteDeStuffing(stuffedData);

	let hexSequences = deStuffedData.split(" ");
	hexSequences.pop();

	let resultData = [];
	for (i = 0; i < hexSequences.length; i++) {
		resultData.push(String.fromCharCode(parseInt(hexSequences[i], 16)));
	}

	result = resultData.join("");

	if (statusWindow) {
		statusWindow.webContents.send(
			"status",
			`[${time}] Byte-Stuffing of the data: ${stuffedData}`
		);
	}
	if (outputInfoWindow) {
		outputInfoWindow.webContents.send("outputReply", result);
	}
};

const byteStuffing = (hexData) => {
	hexData = hexData
		.split(ESCSymbol)
		.join(`<${ESCSymbol} ${ESCEncodeSymbol}>`);
	hexData = hexData
		.split(flag)
		.join(`<${ESCSymbol} ${encodeSymbol}>`); 

	return hexData;
};

const byteDeStuffing = (stuffedData) => {
	stuffedData = stuffedData
		.split(`<${ESCSymbol} ${encodeSymbol}>`)
		.join(flag); 

	stuffedData = stuffedData
		.split(`<${ESCSymbol} ${ESCEncodeSymbol}>`)
		.join(ESCSymbol); 

	return stuffedData;
};

const onExitListener = (event, arg) => {
	app.quit();
};

app.on("ready", createWindow);

app.on("window-all-closed", function () {
	app.quit();
});
