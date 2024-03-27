//  Singleton.js   (contains methods and classes shared across different modules)
/*

Name: Pratik Narendra Gupta
ID: 251 211 859

Singleton.js contains common methods that are used by multiple classes in your application, like hashing functions for generating peer IDs or checking version numbers of messages.

*/

const crypto = require('crypto');

let sequenceNumber;
let timerInterval = 10;
let timer;

function timerRun() {
    timer++;
    if (timer == 4294967295) {
        timer = Math.floor(1000 * Math.random()); // reset timer to be within 32 bit size
    }
}

module.exports = {
    init: function () {
        timer = Math.floor(1000 * Math.random()); /* any random number */
        setInterval(timerRun, timerInterval);
        sequenceNumber = Math.floor(1000 * Math.random()); /* any random number */
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function () {
        sequenceNumber++;
        return sequenceNumber;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function () {
        return timer;
    },

    getInstance: function () {
        // return kademlia instance
        return this;
    },

    //--------------------------
    //getPeerID: takes the IP and port number and returns 4 bytes Hex number
    //--------------------------
    getPeerID: function (IP, port) {
        // use SHAKE-256 to generate 4 bytes of hash from IP and port
        // A peer’s ID (the default ID mode) is based on a 4 bytes shake256 hash of its IPv4 peerIP and port number port. Therefore, we assume 32-bit identifiers, which we will express in hex base (8 character address).

        // Concatenate IP and port to form a unique string
        const data = IP + port;

        // Create a SHAKE-256 hash of the data
        const hash = crypto.createHash('shake256', { outputLength: 4 });

        // Update the hash with the data and return the digest as a hex string
        return hash.update(data).digest('hex');
    },

    //--------------------------
    //Hex2Bin: convert Hex string into binary string
    //--------------------------
    Hex2Bin: function (hex) {
        var bin = ""
        hex.split("").forEach(str => {
            bin += parseInt(str, 16).toString(2).padStart(8, '0')
        })
        return bin
    },

    //--------------------------
    //XORing: finds the XOR of the two Binary Strings with the same size
    //--------------------------
    XORing: function (a, b) {
        let ans = "";
        for (let i = 0; i < a.length; i++) {
            // If the Character matches
            if (a[i] == b[i])
                ans += "0";
            else
                ans += "1";
        }
        return ans;
    }

};