const fs = require('fs');
let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');

module.exports = {
    handleClientJoining: function (sock) {
        sock.on('data', (data) => {

            let version = parseBitPacket(data, 0, 4);
            let requestType = parseBitPacket(data, 4, 4);
            let imageNameSize = parseBitPacket(data, 8, 24);
            let imageType = parseBitPacket(data, 32, 4);
            let timestamp = parseBitPacket(data, 64, 32);

            let name = bytesToString(data.slice(12, 12 + imageNameSize));

            console.log("Version: " + version);
            console.log("Request Type: " + requestType);
            console.log("Image Name Size: " + imageNameSize);
            console.log("Image Type: " + imageType);
            console.log("Timestamp: " + timestamp);
            console.log("Name: " + name);


            let responsePacket;
            let imageData;

            // check in ./images folder if the image exists
            if (fs.existsSync('./images/' + name)) {
                imageData = fs.readFileSync('./images/' + name);
                responsePacket = ITPpacket.init(1, 1, imageData);
            } else {
                responsePacket = ITPpacket.init(2, 0, '');
            }


            sock.write(responsePacket);
        });
    }
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
        // let us get the actual byte position of the offset
        let bytePosition = Math.floor((offset + i) / 8);
        let bitPosition = 7 - ((offset + i) % 8);
        let bit = (packet[bytePosition] >> bitPosition) % 2;
        number = (number << 1) | bit;
    }
    return number;
}

// Prints the entire packet in bits format
function printPacketBit(packet) {
    var bitString = "";

    for (var i = 0; i < packet.length; i++) {
        // To add leading zeros
        var b = "00000000" + packet[i].toString(2);
        // To print 4 bytes per line
        if (i > 0 && i % 4 == 0) bitString += "\n";
        bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}