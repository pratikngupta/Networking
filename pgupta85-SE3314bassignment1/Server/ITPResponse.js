/*
Name: Pratik Narendra Gupta
Student ID: 251211859
*/


const fs = require('fs');

module.exports = {
    packet: [],

    //--------------------------
    // getPacket: returns the entire packet
    // version: the ITP version
    // responseType: the response type (1 for found, 2 for not found)
    // sequenceNumber: the sequence number of the request
    // timestamp: the timestamp of the request
    // imagePath: the path to the image file
    //--------------------------
    getPacket: function (version, responseType, sequenceNumber, timestamp, imagePath, invalid = false) {
        let imageData;
        // Read image file into byte array

        if (!invalid) {
            responseType = 4;
            try {
                // Try to read the image file
                imageData = fs.readFileSync(imagePath);
                responseType = 1;
            } catch (err) {
                // If the image doesn't exist, set response type to "not found" and imageData to empty
                responseType = 2;
                imageData = [];
            }
        } else {

            console.log("Invalid request header. Ignoring request.");
            responseType = 3;
            imageData = [];
        }


        // Initialize the packet with zeros
        this.packet = new Array(12 + imageData.length).fill(0);

        // Store the ITP components to the packet (version, response type, sequence number, timestamp)
        storeBitPacket(this.packet, version, 0, 4);
        storeBitPacket(this.packet, responseType, 4, 2);
        storeBitPacket(this.packet, sequenceNumber, 6, 26);
        storeBitPacket(this.packet, timestamp, 32, 32);
        storeBitPacket(this.packet, imageData.length, 64, 32);

        // Store the image data to the packet
        for (let i = 0; i < imageData.length; i++) {
            this.packet[12 + i] = imageData[i];
        }

        // Return the packet as a Uint8Array
        return new Uint8Array(this.packet);
    }
};
//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}

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