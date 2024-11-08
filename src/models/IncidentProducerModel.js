const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
    clientId: 'incidents_service',
    brokers: ['kafka_kraft:9092'],    // Change when dockerised
});

// Create a single producer instance
const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log('Producer connected successfully.');
};

const disconnectProducer = async () => {
    await producer.disconnect();
    console.log('Producer disconnected successfully.');
};

module.exports = {
    producer,
    connectProducer,
    disconnectProducer,
};