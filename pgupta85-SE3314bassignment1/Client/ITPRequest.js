/*
Name: Pratik Narendra Gupta
Student ID: 251211859
*/

// Map of image types to their corresponding codes
const imageTypes = new Map([
    ["png", 1],
    ["bmp", 2],
    ["tiff", 3],
    ["jpeg", 4],
    ["gif", 5],
    ["raw", 15]
]);

module.exports = {
    // Function to create a byte packet for an ITP request
    // version: the ITP version
    // imageType: the type of the image (e.g., "png", "jpeg")
    // fileName: the name of the image file
    getBytePacket: function (version, imageType, fileName) {
        // Initialize the packet with zeros
        let packet = new Array(12 + fileName.length).fill(0);

        // Generate a random timestamp
        let timestamp = Math.floor(Math.random() * 999) + 1;

        // Get the code for the image type
        let type = imageTypes.get(imageType) || 0;

        // Store the ITP components to the packet (version, request type, timestamp, image type, file name length)
        storeBitPacket(packet, version, 0, 4);
        storeBitPacket(packet, 0, 30, 2);
        storeBitPacket(packet, timestamp, 32, 32);
        storeBitPacket(packet, type, 64, 4);
        storeBitPacket(packet, fileName.length, 68, 28);

        // Convert the file name to bytes and store it to the packet
        let fileNameBytes = stringToBytes(fileName);
        packet = [...packet.slice(0, 12), ...fileNameBytes];

        // Return the packet as a Uint8Array
        return new Uint8Array(packet);
    },

    // Function to check if an image type is valid
    // imageType: the type of the image (e.g., "png", "jpeg")
    isValidImageType: function (imageType) {
        return imageTypes.has(imageType.toLowerCase());
    }
};

// Function to convert a string to a byte array
function stringToBytes(str) {
    var ch,
        st,
        re = [];
    for (var i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);
        st = [];
        do {
            st.push(ch & 0xff);
            ch = ch >> 8;
        } while (ch);
        re = re.concat(st.reverse());
    }
    return re;
}

// Function to store an integer value into a specific bit position in the packet
// packet: the packet to store the value in
// value: the value to store
// offset: the bit position to start storing the value at
// length: the number of bits to store the value in
function storeBitPacket(packet, value, offset, length) {
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