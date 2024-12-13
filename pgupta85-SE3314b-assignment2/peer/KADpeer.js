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

// if -p is provided, then start the program as a client peer
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
        console.log(`Connected to ${serverIP}:${serverPORT} at timestamp: ${Singleton.getTimestamp()}`);
        const helloMessage = new kadPTP(1, 1, [], peerName);
        client.write(helloMessage.toBuffer());
        port = client.localPort;
        peer2.setPort(port);
        console.log(`This peer is ${peerIP}:${port} located at ${peerName} [${peer2.getID()}]`);
    });

    client.on('data', (data) => {
        const message = kadPTP.fromBuffer(data);
        console.log(message);

        if (message.messageType == 2) {
            console.log(`Received welcome message from ${serverIP}:${serverPORT} with ID: ${peer2.getID()}`);
            console.log(`Received message: ${message.senderName}`);
            const newPeer = new Peer(message.senderName, serverIP, serverPORT);
            const bucketIndex = table2.getBucketIndex(newPeer);

            if (table2.isBucketEmpty(bucketIndex)) {
                console.log(`Bucket P${bucketIndex} has no value, adding ${newPeer.getID()}`);
                table2.pushBucket(newPeer);
            }

            table2.refreshBuckets(message.peers);
            console.log('Refresh k-Bucket operation is performed');

            table2.sendHello();
            console.log('Hello packet has been sent to all peers in DHT.');
        }
    });
}
// if -p is not provided, then start the program as a first peer in the network
function firstRun() {
    // get the name of the peer
    const peerName = argv.n;
    console.log(`Peer name: ${peerName}`);

    peerIP = '127.0.0.1'; // Default if no -p option provided
    port = 0; // Default port

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

            const newPeer = new Peer(socket.remoteAddress, socket.remotePort, message.senderName);
            const bucketIndex = table.getBucketIndex(newPeer);

            if (table.isBucketEmpty(bucketIndex)) {
                console.log(`Bucket P${bucketIndex} has no value, adding ${newPeer.getID()}`);
                table.pushBucket(newPeer);
            } else {
                console.log(`Bucket P${bucketIndex} is full, checking if we need to change the stored value`);
                const currentPeer = table.getPeer(bucketIndex);
                if (table.isNewPeerCloser(bucketIndex, newPeer)) {
                    console.log(`New peer is closer, updating value`);
                    table.updateBucket(bucketIndex, newPeer);
                } else {
                    console.log(`Current value is closest, no update needed`);
                }
            }

            table.refreshBuckets(message.peers);
            console.log('Refresh k-Bucket operation is performed');

            const welcomeMessage = new kadPTP(1, 2, [], 'Server');
            socket.write(welcomeMessage.toBuffer(), () => {
                console.log('Welcome packet has been sent.');
                // socket.end();
                console.log('Connection closed');
            });

            table.printDHTTable();
        }

        if (message.messageType == 2) {
            console.log(`Received welcome message from ${clientAddress} with ID: ${message.senderName}`);
            console.log(`Received message: ${message.senderName}`);

            const newPeer = new Peer(socket.remoteAddress, socket.remotePort, message.senderName);
            const bucketIndex = table.getBucketIndex(newPeer);

            if (table.isBucketEmpty(bucketIndex)) {
                console.log(`Bucket P${bucketIndex} has no value, adding ${newPeer.getID()}`);
                table.pushBucket(newPeer);
            }

            table.refreshBuckets(message.peers);
            console.log('Refresh k-Bucket operation is performed');

            table.sendHello();
            console.log('Hello packet has been sent to all peers in DHT.');
        }
    });

    socket.on('close', () => {
        console.log(`Connection from ${clientAddress} closed`);
    });
}