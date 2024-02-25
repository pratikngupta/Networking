let net = require("net");
let fs = require("fs");
let open = require("open");
let yargs = require("yargs/yargs");
let { hideBin } = require("yargs/helpers");
let ITPpacket = require("./ITPRequest");

let argv = yargs(hideBin(process.argv)).argv;

let client = new net.Socket();
let server = argv.s.split(":");
let serverIP = server[0];
let serverPort = server[1];
let imageName = argv.q;
let version = argv.v;

client.connect(serverPort, serverIP, function () {
  let packet = ITPpacket.init(version, imageName);
  client.write(packet);
});

client.on("data", function (data) {
  let responseType = parseBitPacket(data, 30, 2);
  let imageSize = parseBitPacket(data, 90, 32);
  let imageData = data.slice(12);

  if (responseType === 1) {
    fs.writeFile(imageName, imageData, function (err) {
      if (err) throw err;
      open(imageName);
    });
  } else {
    console.error("Image not found");
  }
});

client.on("close", function () {
  console.log("Connection closed");
});

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



