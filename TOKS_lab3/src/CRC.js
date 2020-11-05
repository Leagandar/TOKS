module.exports = {
	CRCEncoder: (byteArray) => {
		byteArray = byteArray.map((byte) => {
			return +byte.charCodeAt(0).toString(16);
		});
		let generator = 0x1d;
		let crc = 0;
		byteArray.forEach((currByte) => {
			crc ^= currByte;
			for (let i = 0; i < 8; i++) {
				if ((crc & 0x80) != 0) {
					crc = crc << 1;
					crc = parseInt(crc.toString(2).slice(1), 2);
					crc = crc ^ generator;
				} else {
					crc <<= 1;
				}
			}
		});

		return crc;
	},

	CRCOneByteEncoder: (byteVal) => {
		let generator = 0x1d;
		let crc = byteVal;
		for (let i = 0; i < 8; i++) {
			if ((crc & 0x80) != 0) {
				crc = crc << 1;
				crc = crc ^ generator;
				crc = parseInt(crc.toString(2).slice(1), 2);
			} else {
				crc <<= 1;
			}
		}
		console.log(crc.toString(2));
		return parseInt(crc.toString(2), 2);
	},

	CRCOneByteDecoder: (byteVal) => {
		console.log(byteVal.toString(2));
		let generator = 0x1d;
		let crc = byteVal;
		//console.log("START OF DECODING");
		//console.log(crc.toString(2));
		//console.log(generator.toString(2));
		for (let i = 0; i < 8; i++) {
			if ((crc & 0x8000) != 0) {
				//console.log(i, "BEFORE", crc.toString(2));
				crc = crc << 1;
				crc = parseInt(crc.toString(2).slice(1), 2);
				//console.log(i, "After SDVIG", crc.toString(2));
				//console.log(i, "After vipukich", crc.toString(2));
				//console.log(i, "              ", generator.toString(2));
				crc = crc ^ generator;
				if (crc === 0) return crc;
				//console.log(i, "After XOR     ", crc.toString(2));
			} else {
				crc <<= 1;
			}
		}
		//console.log("crc here");
		//console.log(crc);
		return crc;
	},

	CRCDecoder: (byteArray) => {
		let generator = 0x1d;
		let crc = 0;
		byteArray.forEach((currByte) => {
			crc ^= currByte;
			for (let i = 0; i < 8; i++) {
				if ((crc & 0x80) != 0) {
					crc = crc << 1;
					crc = parseInt(crc.toString(2).slice(1), 2);
					crc = crc ^ generator;
				} else {
					crc <<= 1;
				}
			}
		});

		return crc;
	},

	CRCCreateChunks: (inputData) => {
		let chunk = [],
			chunkArray = [];
		for (let i = 0; i < inputData.length; ++i) {
			chunk.push(inputData[i]);
			if ((i + 1) % 19 == 0) {
				//console.log(i, chunk);
				chunkArray.push(chunk);
				chunk = [];
			}
		}
		if (chunk.length) {
			for (let i = 0; i < 19 - chunk.length; ++i)
				chunk.push(String.fromCharCode(48));
			chunkArray.push(chunk);
		}
		return chunkArray;
	},
};

//CRCOneByteDecoder
// console.log("SS");
// 		let generator = 0x1d;
// 		let crc = byteVal;
// 		console.log(byteVal.toString(2));
// 		for (let i = 0; i < 16; i++) {
// 			if ((crc & 0x8000) != 0) {
// 				console.log(i, "BEFORE          ", crc.toString(2));
// 				console.log(i, "After SDVIG     ", crc.toString(2));
// 				//crc = parseInt(crc.toString(2).slice(1), 2);
// 				console.log(i, "After vipukich  ", crc.toString(2));
// 				console.log(i, "                ", generator.toString(2));
// 				let tempCrc = parseInt(crc.toString(2).substring(0, 8), 2);
// 				tempCrc = tempCrc ^ generator;
// 				console.log("tempCrc           ", tempCrc.toString(2));
// 				crc = parseInt(tempCrc.toString(2) + crc.toString(2).substring(8), 2);
// 				console.log("FINISHEDCRC       ", crc.toString(2));
// 				if (crc === 0) return crc;
// 				console.log(i, "After XOR       ", crc.toString(2));
// 			} else {
// 				crc <<= 1;
// 			}
// 		}
// 		crc = crc.toString(2).substring(0, 8);
// 		console.log(crc.toString(2));
// 		return parseInt(crc.toString(2), 2);
