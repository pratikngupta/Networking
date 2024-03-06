/*
Name: Pratik Narendra Gupta
Student ID: 251211859
*/


const net = require("net");
const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs").promises;
const open = require("open");
const path = require("path");
const ITPpacket = require("./ITPRequest");

// Check if all required arguments are provided
if (!argv.s || !argv.q || !argv.v) {
    console.error("Error: Missing arguments. Please provide server address (-s), query image (-q), and version (-v).");
    process.exit(1);
}

// Parse server address and image name from arguments
const [serverIP, serverPort] = argv.s.split(":");
const [imageName, imageExtension] = argv.q.split(".");

// Create a new TCP client
const client = net.createConnection({ host: serverIP, port: serverPort }, async () => {

    // Check if the image extension is valid
    if (!ITPpacket.isValidImageType(imageExtension)) {
        console.log("Error: Image extension not supported: " + imageExtension);
        console.log("Will not send request to server.");
        console.log("Supported image types: jpeg, png, gif, tiff, bmp and raw");

        process.exit(1);
    }

    console.log(`Connected to ImageDB server on: ${serverIP}:${serverPort}`);

    // Create a new ITP packet and send it to the server
    const packet = ITPpacket.getBytePacket(argv.v, imageExtension.toLowerCase(), imageName);
    client.write(packet);
}).on('error', (err) => {
    console.error('Failed to connect to server:', err);
    process.exit(1);
});

// Event handler for receiving data from the server
client.on("data", async (data) => {
    console.log("\nITP packet header received: ");
    printPacketBit(data.subarray(0, 12));

    // Parse the packet header
    const version = parseBitPacket(data, 0, 4);
    const responseType = parseBitPacket(data, 4, 2);
    const sequenceNumber = parseBitPacket(data, 6, 26);
    const timestamp = parseBitPacket(data, 32, 32);
    const imageSize = parseBitPacket(data, 64, 32);

    console.log("\nServer sent: ");
    console.log(`    --ITP version = ${version}`);
    console.log(`    --Response Type = ${getResponseType(responseType)}`);
    console.log(`    --Sequence Number = ${sequenceNumber}`);
    console.log(`    --Timestamp = ${timestamp}`);

    // If the image was found, save it to a file and open it
    if (responseType === 1) {
        const imageData = data.subarray(12, 12 + imageSize);
        const imagePath = path.join(__dirname, "downloads", `${imageName}.${imageExtension}`);

        // Check if directory exists, if not then create it
        await fs.mkdir(path.dirname(imagePath), { recursive: true });

        await fs.writeFile(imagePath, imageData);
        await open(imagePath);
    }

    client.end();
    console.log("\nDisconnected from the server");
});

// Event handler for closing the connection
client.on("close", () => {
    console.log("Connection closed");
});

// Event handler for errors with the server
client.on("error", (err) => {
    console.log("Error with the server. Closing connection");
    client.end();
});

// Function to get the response type as a string
function getResponseType(responseType) {
    const responseTypes = ["Query", "Found", "Not found", "Invalid Packet"];
    return responseTypes[responseType] || "Unknown";
}

// Function to parse a packet and return the integer value of the extracted bits fragment
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (let i = 0; i < length; i++) {
        const bytePosition = Math.floor((offset + i) / 8);
        const bitPosition = 7 - ((offset + i) % 8);
        const bit = (packet[bytePosition] >> bitPosition) % 2;
        number = (number << 1) | bit;
    }
    return number;
}

// Function to print the entire packet in bits format
function printPacketBit(packet) {
    let bitString = "";

    for (let i = 0; i < packet.length; i++) {
        const b = "00000000" + packet[i].toString(2);
        if (i > 0 && i % 4 == 0) bitString += "\n";
        bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
}