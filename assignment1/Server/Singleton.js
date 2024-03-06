/*
Name: Pratik Narendra Gupta
Student ID: 251211859
*/


// The Singleton function is responsible for keeping track of time and sequence numbers in the server.
module.exports = {
    timestamp: null,
    interval: null,
    sequenceNumber: null,

    // Initialize the timestamp and sequence number to random values
    // and set an interval to increment the timestamp every 10ms
    init: function () {
        // Initialize the sequence number and timestamp to random values between 1 and 999
        this.sequenceNumber = Math.floor(Math.random() * 999) + 1;
        this.timestamp = Math.floor(Math.random() * 999) + 1;

        // Set an interval to increment the timestamp every 10ms
        this.interval = setInterval(() => {
            this.timestamp += 1;

            // Reset the timestamp when it reaches 2^32
            if (this.timestamp >= Math.pow(2, 32)) {
                this.timestamp = 0;
            }
        }, 10);
    },

    // getSequenceNumber: Increment and return the current sequence number
    // The sequence number is reset to 0 when it reaches 2^26
    getSequenceNumber: function () {
        return this.sequenceNumber = (this.sequenceNumber + 1) % Math.pow(2, 26);
    },

    // getTimestamp: Return the current timer value
    getTimestamp: function () {
        return this.timestamp;
    },
};