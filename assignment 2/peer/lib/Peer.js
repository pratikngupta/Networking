// Peer.js        (contains the peer information class which holds info about peers like IP, port, ID etc.)

/*

Name: Pratik Narendra Gupta
ID: 251 211 859

Peer.js is a class that holds information about each peer in the network, like its IP address, port number, ID, etc.


*/

const Singleton = require('./Singleton');

class Peer {
    constructor(IP, port, peerName = "Server") {
        this.IP = IP;
        this.port = port;
        this.name = peerName;
        this.ID = Singleton.getPeerID(IP, port);
    }

    //--------------------------
    //getID: return the peer ID
    //--------------------------
    getID() {
        return this.ID;
    }

    //--------------------------
    //getIP: return the peer IP
    //--------------------------
    getIP() {
        return this.IP;
    }

    //--------------------------
    //getPort: return the peer port
    //--------------------------
    getPort() {
        return this.port;
    }

    //--------------------------
    //setIP: set the peer IP
    //--------------------------
    setIP(IP) {
        this.IP = IP;
    }

    //--------------------------
    //setPort: set the peer port
    //--------------------------
    setPort(port) {
        this.port = port;
        // update the ID
        this.ID = Singleton.getPeerID(this.IP, this.port);
    }

    //--------------------------
    //setID: set the peer ID
    //--------------------------

    setID(ID) {
        this.ID = ID;
    }

    //--------------------------
    //toString: return the peer IP and port as a string
    //--------------------------
    fullAddress() {
        return this.IP + ":" + this.port;
    }
}


module.exports = Peer;