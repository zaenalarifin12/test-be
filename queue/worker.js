require("dotenv").config();
const amqp = require("amqplib");
const axios = require("axios");

const RABBITMQ_URL = process.env.RABBITMQ_URL;

const startWorker = async () => {
  const rabbitMqConnection = await amqp.connect(RABBITMQ_URL);
  const channel = await rabbitMqConnection.createChannel();
  await channel.assertQueue("email-queue");

  // channel.prefetch(100);
  const message = await channel.get("email-queue");
  if (message) {
    console.log(`[QUEUE] Processing email for ${message.content.toString()}`);

    try {
      const emailMessage = JSON.parse(message.content.toString());
      const response = await axios.post(
        "https://email-service.digitalenvision.com.au/send-email",
        emailMessage
      );
      console.log(`[QUEUE] Success ${emailMessage.message}`, response.data);
      
      channel.ack(message);
    } catch (error) {
      console.error(
        `[QUEUE] Failed to send email`,
        error.message
      );
      channel.nack(message, false, true);
    }

    // consume the next message
    // setTimeout(() => {
      startWorker();
    // }, 30000);
  } else {
    // no more messages in the queue, close channel and connection
    await channel.close();
    await rabbitMqConnection.close();
    console.log("No more messages in queue");
  }
};
// async function startWorker() {
//   const rabbitMqConnection = await amqp.connect(RABBITMQ_URL);
//   const channel = await rabbitMqConnection.createChannel();
//   await channel.assertQueue("email-queue");

//   channel.prefetch(2);

//   channel.consume("email-queue", async (message) => {
//     const emailMessage = JSON.parse(message.content.toString());
//     console.log(`Processing email for ${emailMessage.message}`);

//     try {
//       const response = await axios.post(
//         "https://email-service.digitalenvision.com.au/send-email",
//         emailMessage
//       );
//       console.log(`Success ${emailMessage.message}`, response.data);
//     } catch (error) {
//       console.error(
//         `Failed to send email to ${emailMessage.message}`,
//         error.message
//       );
//     } finally {
//       channel.ack(message);
//     }
//   });
// }

async function insertQueue(user) {
  const rabbitMqConnection = await amqp.connect(RABBITMQ_URL);
  const channel = await rabbitMqConnection.createChannel();
  await channel.assertQueue("email-queue");
  await channel.sendToQueue(
    "email-queue",
    Buffer.from(
      JSON.stringify({
        email: "test@digitalenvision.com.au",
        message: `Hey, ${user?.first_name} ${user?.last_name} 🎉🎂🎁 it's your birthday! 🎁🎂🎉`,
      })
    )
  );
}
module.exports = {
  startWorker,
  insertQueue,
};
