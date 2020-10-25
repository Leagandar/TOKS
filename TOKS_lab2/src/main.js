const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");

// var 19
let inputInfoWindow,
	isInitialized = false,
	flag = "77", // 119
	ESCSymbol = "75", //117
	encodeSymbol = "57", // 87
	ESCEncodeSymbol = "65"; //101

function createWindow() {
	inputInfoWindow = new BrowserWindow({
		width: 1000,
		height: 600,
		resizable: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	inputInfoWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "./infoWindow.html"),
			protocol: "file:",
			slashes: true,
		})
	);

	inputInfoWindow.on("closed", function () {
		inputInfoWindow = null;
		app.quit();
	});

	inputInfoWindow.on("ready-to-show", function () {
		console.log("erg");
	});

	ipcMain.on("data", onDataListener);
	ipcMain.on("Initialization", onInitializationListener);
	ipcMain.on("Exit", () => {
		app.quit();
	});
	inputInfoWindow.show();
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
		if (inputInfoWindow) {
			let symbol = String.fromCharCode(parseInt(flag, 16));
			inputInfoWindow.webContents.send(
				"status",
				`[${time}] Stuffing Flag: ${flag}. Symbol of stuffing flag:${symbol}`
			);
			isInitialized = true;
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

	let stuffedHexSequences = stuffedData.split(" ");
	stuffedHexSequences.pop();

	let resultStuffedData = [];
	for (i = 0; i < stuffedHexSequences.length; i++) {
		console.log("hex:" + stuffedHexSequences[i]);
		let symbol = String.fromCharCode(parseInt(stuffedHexSequences[i], 16));
		console.log("sym:" + symbol);
		resultStuffedData.push(symbol);
	}

	stuffedResult = resultStuffedData.join("");

	let deStuffedData = byteDeStuffing(stuffedData);

	let hexSequences = deStuffedData.split(" ");
	hexSequences.pop();

	let resultData = [];
	for (i = 0; i < hexSequences.length; i++) {
		resultData.push(String.fromCharCode(parseInt(hexSequences[i], 16)));
	}

	result = resultData.join("");

	if (inputInfoWindow) {
		inputInfoWindow.webContents.send(
			"status",
			`[${time}] Byte-Stuffing of the data: ${stuffedResult}`
		);
		inputInfoWindow.webContents.send("outputReply", result);
	}
};

const byteStuffing = (hexData) => {
	hexData = hexData
		.split(ESCSymbol)
		.join(`3C ${ESCSymbol} ${ESCEncodeSymbol} 3E`);
	hexData = hexData.split(flag).join(`3C ${ESCSymbol} ${encodeSymbol} 3E`);

	return hexData;
};

const byteDeStuffing = (stuffedData) => {
	stuffedData = stuffedData
		.split(`3C ${ESCSymbol} ${encodeSymbol} 3E`)
		.join(flag);

	stuffedData = stuffedData
		.split(`3C ${ESCSymbol} ${ESCEncodeSymbol} 3E`)
		.join(ESCSymbol);

	return stuffedData;
};

app.on("ready", () => {
	createWindow();
});


app.on("window-all-closed", function () {
	app.quit();
});
