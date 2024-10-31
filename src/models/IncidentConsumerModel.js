const {Kafka} = require('kafkajs')
const {manage} = require('./MonitoringModels');

/**
 * File dedicated to the consumer of an incident
 */


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'], //kafa address
});

const consumer = kafka.consumer({groupId: 'incident_group'});

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({topic: 'incidents', fromBeginning: true});

    await consumer.run({
        eachMessage: async ({ topic, partition, message}) => {
            manage(message);
        }
    })
}

run().catch(console.error);