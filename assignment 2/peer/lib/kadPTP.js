// Kademlia.js    (contains the main Kademlia network class with all its functions)

/*

Name: Pratik Narendra Gupta
ID: 251 211 859

Kademlia.js contains the main Kademlia network class which includes all the methods related to the Kademlia DHT. It uses the Peer.js and Message.js classes.


*/

const Singleton = require('./Singleton');
const Peer = require('./Peer');



class kadPTP {

    constructor(version, messageType, peers, senderName) {
        this.version = version; // 4-bit ITP version field
        this.messageType = messageType; // 7-bit field
        this.numberOfPeers = peers.length; // 9-bit field
        this.senderNameLength = senderName.length; // 12-bit field
        this.peers = peers; // List of peers
        this.senderName = senderName; // Sender name
    }

    toBuffer() {
        const buffer = Buffer.alloc(5 + this.numberOfPeers * 6 + this.senderNameLength);
        let offset = 0;

        buffer.writeUInt8(this.version << 4 | this.messageType, offset);
        offset += 1;

        buffer.writeUInt16BE(this.numberOfPeers, offset);
        offset += 2;

        buffer.writeUInt16BE(this.senderNameLength, offset);
        offset += 2;

        this.peers.forEach(peer => {
            const ipBytes = peer.ip.split('.').map(Number);
            ipBytes.forEach(byte => {
                buffer.writeUInt8(byte, offset);
                offset += 1;
            });

            buffer.writeUInt16BE(peer.port, offset);
            offset += 2;
        });

        for (let i = 0; i < this.senderNameLength; i++) {
            buffer.writeUInt8(this.senderName.charCodeAt(i), offset);
            offset += 1;
        }

        return buffer;
    }

    static fromBuffer(buffer) {
        let offset = 0;

        const version = buffer.readUInt8(offset) >> 4;
        const messageType = buffer.readUInt8(offset) & 0x0F;
        offset += 1;

        const numberOfPeers = buffer.readUInt16BE(offset);
        offset += 2;

        const senderNameLength = buffer.readUInt16BE(offset);
        offset += 2;

        const peers = [];
        for (let i = 0; i < numberOfPeers; i++) {
            const ip = `${buffer.readUInt8(offset)}.${buffer.readUInt8(offset + 1)}.${buffer.readUInt8(offset + 2)}.${buffer.readUInt8(offset + 3)}`;
            const port = buffer.readUInt16BE(offset + 4);
            peers.push({ ip, port });
            offset += 6;
        }

        const senderName = buffer.toString('utf8', offset, offset + senderNameLength);
        offset += senderNameLength; // Update the offset after reading the sender's name

        return new kadPTP(version, messageType, peers, senderName);
    }
}

module.exports = kadPTP;