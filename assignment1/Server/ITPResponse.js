
// You may need to add some statements here

let sequenceNumber = Math.floor(Math.random() * Math.pow(2, 26));
let timestamp = Date.now();

module.exports = {
    init: function (responseType, imageCount, imageData) {
        let packet = Buffer.alloc(12);
        storeBitPacket(packet, 9, 0, 4); // ITP version
        storeBitPacket(packet, responseType, 30, 2); // Response type
        storeBitPacket(packet, sequenceNumber, 32, 26); // Sequence number
        storeBitPacket(packet, timestamp, 58, 32); // Timestamp
        storeBitPacket(packet, imageCount, 90, 16); // Image count

        sequenceNumber = (sequenceNumber + 1) % Math.pow(2, 26);
        timestamp = Date.now();

        let imageBuffer = Buffer.from(imageData);
        return Buffer.concat([packet, imageBuffer]);
    },

    getPacket: function () {
        return this.init(1, 1, "image"); // Example usage
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