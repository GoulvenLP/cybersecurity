#!/bin/bash



# container name
CONTAINER_NAME="kafka-kraft"
KAFKA_IMAGE="apache/kafka:3.8.1"
TOPIC_INCIDENTS="incidents"

# Verify if the container is already running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Container $CONTAINER_NAME is already running."
    exit 1
fi

# delete previous container if exists
if [ "$(docker ps -aq -f status=exited -f name=$CONTAINER_NAME)" ]; then
    docker rm $CONTAINER_NAME
fi

# Run Kafka in KRaft mode
docker run -d \
  --name kafka-kraft \
    -p 9092:9092 \
    -p 9093:9093 \
    -e KAFKA_KRAFT_MODE=true \
    -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT \
    -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
    -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
    -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
    -e KAFKA_PROCESS_ROLES=broker,controller \
    -e KAFKA_NODE_ID=1 \
    -e KAFKA_LOG_DIRS=/var/lib/kafka/data \
    -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
    $KAFKA_IMAGE

# Display logs to check if everything is running properly
echo "Kafka running in KRaft mod. Displaying logs..."
docker logs -f $CONTAINER_NAME

echo "Creation of topic '$TOPIC_INCIDENTS'..."
docker exec -it $CONTAINER_NAME /opt/kafka/bin/kafka-topics.sh \
  --create \
  --topic $TOPIC_INCIDENTS \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1

# Verify if the topic was created
if [ $? -eq 0 ]; then
    echo "Topic '$TOPIC_INCIDENTS' successfully created."
else
    echo "Error while trying to create topic '$TOPIC_INCIDENTS'."
    exit 1
fi

# Listing existing topics
echo "List of currently existing topics:"
docker exec -it $CONTAINER_NAME kafka-topics.sh --list --bootstrap-server localhost:9092