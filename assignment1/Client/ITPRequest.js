// You may need to add some statements here

let timestamp = Date.now();
let imageName = '';

module.exports = {
  init: function (imageType, name) {
    let data = Buffer.alloc(12);
    storeBitPacket(data, 90, 0, 4); // ITP version
    storeBitPacket(data, 0, 4, 4); // Request type
    storeBitPacket(data, timestamp, 32, 32); // Timestamp
    storeBitPacket(data, imageType, 64, 4); // Image type
    storeBitPacket(data, name.length, 68, 28); // File name size

    timestamp = Date.now();
    imageName = name;

    let nameBuffer = Buffer.from(stringToBytes(name));
    return Buffer.concat([data, nameBuffer]);
  },

  getBytePacket: function () {
    return this.init(1, "image"); // Example usage
  }
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

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