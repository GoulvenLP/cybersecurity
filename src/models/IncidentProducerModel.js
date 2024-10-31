const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'incident-service',
    brokers: ['127.0.0.1:9092'], //replace localhost by 'kafka' if API on docker
});

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log('Producer connected');
};

const sendToProducer = async (incident) => {
    await producer.send({
        topic: 'incidents',
        messages: [ { value: JSON.stringify(incident) }
        ],
    });
    console.log('Incident sent: ', incident);
};


module.exports = {
    connectProducer,
    sendToProducer,
};