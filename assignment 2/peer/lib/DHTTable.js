


const Peer = require('./Peer');
const Singleton = require('./Singleton');
const kadPTP = require('./kadPTP');
const net = require('net');


// import XORing function from Singleton
const XORing = Singleton.XORing;

class DHTTable {
    constructor(owner) {
        this.owner = owner;
        this.buckets = Array(32).fill(null).map(() => []);
    }

    calculateSharedBits(id1, id2) {
        let sharedBits = 0;
        for (let i = 0; i < 32; i++) {
            if ((id1 >> (31 - i)) === (id2 >> (31 - i))) {
                sharedBits++;
            } else {
                break;
            }
        }
        return Math.min(sharedBits, 31);
    }

    pushBucket(peer) {
        const sharedBits = this.calculateSharedBits(this.owner.id, peer.id);
        if (sharedBits >= 0 && sharedBits < 32) {
            if (this.buckets[sharedBits].length < 1) {
                this.buckets[sharedBits].push(peer);
                console.log(`Bucket P${sharedBits} has no value, adding ${peer.id}`);
            } else {
                console.log(`Bucket P${sharedBits} is full, checking if we need to change the stored value`);
                const currentPeer = this.buckets[sharedBits][0];
                if (this.isNewPeerCloser(sharedBits, peer)) {
                    console.log(`New peer is closer, updating value`);
                    this.buckets[sharedBits][0] = peer;
                } else {
                    console.log(`Current value is closest, no update needed`);
                }
            }
        } else {
            console.error(`Invalid sharedBits value: ${sharedBits}`);
        }
    }

    sendHello() {
        this.buckets.forEach(bucket => {
            if (bucket) {
                bucket.forEach(peer => {
                    // const helloMessage = new kadPTP(1, 1, [], this.owner.IP);
                    // const client = new net.Socket();
                    // console.error(`Failed to connect to peer at ${peer.port}:${peer.name}`);
                    // client.connect(peer.port, peer.name, () => {
                    //     console.log(`Connected to peer at ${peer.port}:${peer.name}`);
                    //     client.write(helloMessage.toBuffer());
                    // });
                    // This is working, but there is issue with the connection
                });
            }
        });
    }

    //refresh the bucket
    refreshBuckets(peers) {
        peers.forEach(peerInfo => {
            const newPeer = new Peer(peerInfo.IP, peerInfo.port, peerInfo.name);
            this.pushBucket(newPeer);
        });
        console.log('Refresh k-Bucket operation is performed');
        this.printDHTTable();
    }

    //update the bucket
    updateBucket(index, newPeer) {
        this.buckets[index][0] = newPeer;
    }

    isNewPeerCloser(index, newPeer) {
        const currentPeer = this.buckets[index][0];
        const currentDistance = XORing(this.owner.ID, currentPeer.ID);
        const newDistance = XORing(this.owner.ID, newPeer.ID);
        return newDistance < currentDistance;
    }

    //getPeer
    getPeer(index) {
        return this.buckets[index][0];
    }

    printDHTTable() {
        console.log('My DHT:');
        for (let i = 0; i < 32; i++) {
            this.buckets[i].forEach(peer => {
                console.log(`[ P${i}, ${peer.IP}:${peer.port}, ${peer.ID} ]`);
            });
        }
    }

    // Function to get the peers in a specific k-bucket
    getBucket(i) {
        return this.buckets[i];
    }

    //implement getBucketIndex
    getBucketIndex(peer) {
        return this.calculateSharedBits(this.owner.id, peer.id);
    }

    // isBucketEmpty
    isBucketEmpty(i) {
        return this.buckets[i].length === 0;
    }


}

module.exports = DHTTable;