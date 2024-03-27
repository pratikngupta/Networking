


const Peer = require('./Peer');

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

    // Function to add a peer to the appropriate k-bucket
    pushBucket(peer) {
        const sharedBits = this.calculateSharedBits(this.owner.id, peer.id);
        if (sharedBits >= 0 && sharedBits < 32) {
            this.buckets[sharedBits].push(peer);
        } else {
            console.error(`Invalid sharedBits value: ${sharedBits}`);
        }
    }

    //print the DHT table
    printDHTTable() {
        console.log('DHT Table:');
        for (let i = 0; i < 32; i++) {
            console.log(`Bucket ${i}:`);
            this.buckets[i].forEach(peer => {
                console.log(`\t${peer.IP} ${peer.ID} ${peer.port} ${peer.name}`);

            });
        }
    }

    // Function to get the peers in a specific k-bucket
    getBucket(i) {
        return this.buckets[i];
    }
}

module.exports = DHTTable;