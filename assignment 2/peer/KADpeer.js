// KADpeer.js          (main program file which initializes the network and starts it)

/*
Name: Pratik Narendra Gupta
ID: 251 211 859
*/

const kadPTP = require('./lib/kadPTP');
const Peer = require('./lib/Peer');
const Singleton = require('./lib/Singleton');
const net = require('net');



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

    // Assuming IP is a IPv4 address and port is an integer
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
        }
    });

    client.on('close', () => {
        console.log('Connection closed');
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

    const server = net.createServer();
    new Promise((resolve, reject) => {
        server.listen(port, peerIP, () => {
            port = server.address().port;
            peer_main.setPort(port);
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
        handleClientJoining(socket); // You need to implement this function
    });
}

function handleClientJoining(socket) {
    const clientIP = socket.remoteAddress;
    const clientPort = socket.remotePort;
    console.log(`New client connected: ${clientIP}:${clientPort}`);

    // Create a new peer for the client
    const clientPeer = new Peer(clientIP, clientPort);

    // // Add the new peer to the DHT table
    // network.pushBucket(clientPeer);

    // // Send a welcome message to the new peer
    // const welcomeMessage = new Message(
    //     1, // Message type 1 means 'Welcome'
    //     network.peerList.length, // Number of peers
    //     network.peerList, // List of peers
    //     network.peer.getName(), // Sender name
    //     [] // Empty list of peers
    // );
    // socket.write(welcomeMessage.toBuffer());


    // The socket may remain open to handle a hello message from the same peer
    // but should be closed right after
    socket.on('data', (data) => {
        const message = kadPTP.fromBuffer(data);
        if (message.messageType == 1) { // Assuming message type 2 means 'Hello'
            console.log(`Received hello message from ${clientIP}:${clientPort} with ID: ${clientPeer.getID()}`);
            console.log(`Received message: ${message.senderName}`);

            // // Assuming pushBucket is a method that adds a peer to the appropriate k-bucket
            // DHTTable.pushBucket(message.sender);
            // refreshBuckets(DHTTable, message.peers);
            // socket.end();

            // send hello message to the client
            const helloMessage = new kadPTP(1, 2, [], 'Server');

            socket.write(helloMessage.toBuffer());
        }
    });
}

function refreshBuckets(DHTTable, peers) {
    peers.forEach(peer => {
        // Assuming pushBucket is a method that adds a peer to the appropriate k-bucket
        DHTTable.pushBucket(peer);
    });
    console.log(DHTTable);
}

function sendHello(DHTTable) {
    DHTTable.buckets.forEach(bucket => {
        bucket.peers.forEach(peer => {
            const helloMessage = new Message(2, DHTTable); // Assuming 2 is the type for 'Hello'
            peer.send(helloMessage);
        });
    });
}