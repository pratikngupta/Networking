let sequenceNumber = 0;
let timestamp = Date.now();

module.exports = {
    init: function () {
        sequenceNumber = Math.floor(Math.random() * Math.pow(2, 26));
        timestamp = Date.now();
    },

    getSequenceNumber: function () {
        let currentSequenceNumber = sequenceNumber;
        sequenceNumber = (sequenceNumber + 1) % Math.pow(2, 26);
        return currentSequenceNumber;
    },

    getTimestamp: function () {
        return timestamp;
    }
};