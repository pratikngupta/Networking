// KADpeer.js          (main program file which initializes the network and starts it)

/*
Name: Pratik Narendra Gupta
ID: 251 211 859
*/

const kadPTP = require('./lib/kadPTP');
const Peer = require('./lib/Peer');
const Singleton = require('./lib/Singleton');
const net = require('net');
const DHTTable = require('./lib/DHTTable');


// check if Singleton is initialized, if not, then initialize it

Singleton.init();

console.log('Singleton initialized');
console.log('Timer:', Singleton.getTimestamp());


// this is the main program file which initializes the network and starts it
// First check the args pass to the program, if -p is not provided, then start the program as a first peer in the network

const argv = require('minimist')(process.argv.slice(2));
const crypto = require('crypto');
const { command } = require('yargs');

// Mandatory arguments: -n <peerName>
if (!argv.n) {
    console.error("Please provide a peer name using the '-n' option.");
    process.exit();
}


let peerIP, port;

// Optional argument: -p <peerIP>:<port>
if (argv.p) {
    clientPeer();
} else {
    firstRun();
}

function clientPeer() {
    const peerName = argv.n;
    [serverIP, serverPORT] = argv.p.split(':');

    [peerIP, port] = ['127.0.0.1', 0];

    const peer2 = new Peer(peerName, peerIP, port);

    // create a table to store the peers
    const table2 = new DHTTable(peer2);

    if (!/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(peerIP) || isNaN(port)) {
        console.error("Invalid IP address or port number.");
        process.exit();
    }

    const client = new net.Socket();
    client.connect(serverPORT, serverIP, () => {
        console.log(`Connected to server on: ${serverIP}:${serverPORT}`);

        // send HELLO message to the server
        const helloMessage = new kadPTP(1, 1, [], 'Client');
        client.write(helloMessage.toBuffer());
        port = client.localPort;
        peer2.setPort(port);
        console.log(`${peerName} listening on ${peerIP}:${port} located at server with ID: ${peer2.getID()} at timestamp ${Singleton.getTimestamp()}`);
    });

    client.on('data', (data) => {
        const message = kadPTP.fromBuffer(data);
        console.log(message);

        if (message.messageType == 2) {
            console.log(`Received welcome message from ${serverIP}:${serverPORT} with ID: ${peer2.getID()}`);
            console.log(`Received message: ${message.senderName}`);
            // Assuming DHTTable is a global variable
            table2.pushBucket(peer2);
            console.log('Refresh k-Bucket operation is performed');
            console.log('My DHT:', DHTTable);
            const helloMessage = new kadPTP(1, 2, [], 'Client');
            client.write(helloMessage.toBuffer());
            console.log('Hello packet has been sent.');
        }
    });
}

function firstRun() {
    // get the name of the peer
    const peerName = argv.n;
    console.log(`Peer name: ${peerName}`);

    peerIP = '127.0.0.1'; // Default if no -p option provided
    port = 25000; // Default port

    // create a new peer
    const peer_main = new Peer(peerIP, port, peerName);
    var table

    const server = net.createServer();
    new Promise((resolve, reject) => {
        server.listen(port, peerIP, () => {
            port = server.address().port;
            peer_main.setPort(port);
            table = new DHTTable(peer_main);
            resolve();
        });
    })
        .then(() => {

            console.log(`Server listening on ${peerIP}:${port} located at server with ID: ${peer_main.getID()} at timestamp ${Singleton.getTimestamp()}`);
        })
        .catch((error) => {
            console.error(`Error: ${error}`);
        });

    // if someone connects to the server, then it is a client
    server.on('connection', (socket) => {
        handleClientJoining(socket, table); // You need to implement this function
    });
}

function handleClientJoining(socket, table) {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`Connected from peer ${clientAddress}`);

    socket.on('data', (data) => {
        const message = kadPTP.fromBuffer(data);
        console.log(message);

        if (message.messageType == 1) {
            console.log(`Received hello message from ${clientAddress} with ID: ${message.senderName}`);
            console.log(`Received message: ${message.senderName}`);
            // Assuming DHTTable is a global variable
            table.pushBucket(new Peer(message.senderName, socket.remoteAddress, socket.remotePort));
            console.log('Refresh k-Bucket operation is performed');
            console.log('My DHT:', table);
            const welcomeMessage = new kadPTP(1, 2, [], 'Server');
            socket.write(welcomeMessage.toBuffer());
            console.log('Welcome packet has been sent.');
            table.printDHTTable();
        }
    });

    socket.on('close', () => {
        console.log(`Connection from ${clientAddress} closed`);
    });
}