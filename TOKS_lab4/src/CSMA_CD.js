module.exports = {
	transferData: (chunks) => {
		transferedData = chunks.map((chunk) => {
			let isCollision = false,
				attempts = 0,
				collisionsNumber = 0;
			while (1) {
				if (checkIsChannelBusy()) {
					continue;
				}

				isCollision = checkIsCollisionDetected();

				if (isCollision && attempts != 10) {
					sendJamSignal();
					attempts++;
					collisionsNumber++;

					waitDelay(attempts);
				} else {
					return {
						data: chunk,
						collisionsNumber: collisionsNumber,
					};
				}
			}
		});
		return transferedData;
	},

	createChunks: (inputData) => {
		let chunk = [],
			chunkArray = [];
		for (let i = 0; i < inputData.length; ++i) {
			chunk.push(inputData[i]);
			if ((i + 1) % 19 == 0) {
				chunkArray.push(chunk);
				chunk = [];
			}
		}
		if (chunk.length) {
			for (let i = 0; i < 19 - chunk.length; ++i) chunk.push(String.fromCharCode(48));
			chunkArray.push(chunk);
		}
		return chunkArray;
	},
};

const checkIsChannelBusy = () => {
	return Math.random() <= 0.6;
};

const checkIsCollisionDetected = () => {
	return Math.random() <= 0.6;
};

const sendJamSignal = () => {
	//simulate sending jam signal (0.5 sek)
	let currentTime = Date.now();
	while (currentTime + 500 > Date.now());
};

const waitDelay = (attempts) => {
	let delay, currentTime;
	if (attempts <= 10) {
		delay = Math.random() * Math.pow(2, attempts);
		currentTime = Date.now();
		while (currentTime + delay < Date.now());
		return;
	} else {
		return;
	}
};
