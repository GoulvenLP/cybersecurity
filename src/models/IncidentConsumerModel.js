const {Kafka} = require('kafkajs')
const {manage} = require('../services/ResponseService');

/**
 * File dedicated to the consumer of an incident
 */


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka_kraft:9092'], //change when dockerized
});

const consumer = kafka.consumer({
    groupId: 'incident_group',
    fetchMinBytes: 1
});


/**
 * Runs the consumer and redirects the data to the ResponseService after having converted the data to a string.
 */
const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({topic: 'incidents', fromBeginning: false});
    console.log('Subscribed to topic incidents');

    await consumer.run({
        eachMessage: async ({ topic, partition, message}) => {
            if (!message || !message.value){
                console.error('Consumer received an undefined message or value');
                return;
            }
            manage(message.value.toString());
        }
    })
}

//run().catch(console.error);
module.exports = {
    runConsumer,
}