/*
Name: Pratik Narendra Gupta
Student ID: 251211859
*/


let ITPpacket = require("./ITPResponse");
let singleton = require("./Singleton");

module.exports = {
    id: 0,

    imageTypeMap: new Map([
        [1, "PNG"],
        [2, "BMP"],
        [3, "TIFF"],
        [4, "JPEG"],
        [5, "GIF"],
        [15, "RAW"]
    ]),

    // Function to get the image type from the map
    getImageType: function (imageType) {
        return this.imageTypeMap.get(imageType) || "unknown";
    },

    // Function to create a packet based on the version, request type, file name, and type
    createPacket: function (version, requestType, fileName, type, invalid) {
        if (version === 9 && requestType === 0) {
            return ITPpacket.getPacket(version, 1, singleton.getSequenceNumber(), singleton.getTimestamp(), `images/${fileName}.${type.toLowerCase()}`);
        } else {
            return ITPpacket.getPacket(version, 4, singleton.getSequenceNumber(), singleton.getTimestamp(), "", invalid);
        }
    },

    // Function to handle a client joining the server
    handleClientJoining: function (sock) {
        this.id = singleton.getTimestamp();
        console.log(`\nClient-${this.id} is connected at timestamp: ${this.id}`);

        // Event listener for data received from the client
        sock.on("data", (data) => {
            invalid = false;

            console.log("\nITP packet received: ");
            printPacketBit(data);

            // Parse the packet data
            let version = parseBitPacket(data, 0, 4);
            let requestType = parseBitPacket(data, 30, 2);
            let timestamp = parseBitPacket(data, 32, 32);
            let imageType = parseBitPacket(data, 64, 4);
            let type = this.getImageType(imageType);
            let fileNameLength = parseBitPacket(data, 68, 28);
            let fileName = bytesToString(data.subarray(12, 12 + fileNameLength));

            // Check the validity of the version number and request type
            if (version !== 9 || (requestType !== 0 && requestType !== 1)) {
                console.log("Invalid request header. Ignoring request.");
                invalid = true;
            }

            // Print the parsed data to the console
            console.log(`\nClient-${this.id} requests: `);
            console.log(`    --ITP version: ${version}`);
            console.log(`    --Timestamp: ${timestamp}`);
            console.log(`    --Request type: ${requestType === 0 ? "Query" : "Unknown"}`);
            console.log(`    --Image file extension(s): ${type}`);
            console.log(`    --Image file name: ${fileName}`);

            // Create a packet and send it to the client
            let packet = this.createPacket(version, requestType, fileName, type, invalid);
            sock.write(packet);
        });

        // Event listener for the client closing the connection
        sock.on("close", () => {
            console.log(`\nClient-${this.id} closed the connection`);
        });

        // Event listener for errors with the client
        sock.on("error", (err) => {
            console.log(`\nError with Client-${this.id}. Closing connection`);
            sock.end();
        });
    },
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