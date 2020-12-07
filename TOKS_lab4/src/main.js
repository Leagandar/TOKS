const CSMA_CD = require("./CSMA_CD.js");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");

// var 19
let inputInfoWindow,
	isInitialized = false;

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

	ipcMain.on("data", onDataListener);
	ipcMain.on("Exit", () => {
		app.quit();
	});
	inputInfoWindow.show();
}

const onDataListener = (event, arg) => {
	let today = new Date();
	let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

	sourceData = arg.toString();

	let chunkArray = CSMA_CD.createChunks(sourceData);
	let transferedData = CSMA_CD.transferData(chunkArray);

	let result = transferedData.map((chunk) => {
		return chunk.data.join("") + "<" + "*".repeat(chunk.collisionsNumber) + ">";
	});
	if (inputInfoWindow) {
		inputInfoWindow.webContents.send("status", `[${time}] Data chunks:\n`);
		result.forEach((element) => {
			inputInfoWindow.webContents.send("status", element);
		});

		inputInfoWindow.webContents.send("outputReply", arg);
		isInitialized = true;
	}
};

app.on("ready", () => {
	createWindow();
});

app.on("window-all-closed", function () {
	app.quit();
});
