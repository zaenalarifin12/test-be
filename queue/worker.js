require("dotenv").config();
const amqp = require("amqplib");
const axios = require("axios");

const RABBITMQ_URL = process.env.RABBITMQ_URL;

async function startWorker() {
  const rabbitMqConnection = await amqp.connect(RABBITMQ_URL);
  const channel = await rabbitMqConnection.createChannel();
  await channel.assertQueue("email-queue");

  channel.consume("email-queue", async (message) => {
    const emailMessage = JSON.parse(message.content.toString());
    console.log(`Processing email for ${emailMessage.email}`);

    try {
      const response = await axios.post(
        "https://email-service.digitalenvision.com.au/send-email",
        emailMessage
      );
      console.log(
        `Sent email to ${emailMessage.email} 🎉🎂🎁 it's your birthday! 🎁🎂🎉`,
        response.data
      );
    } catch (error) {
      console.error(
        `Failed to send email to ${emailMessage.email}`,
        error.message
      );
    } finally {
      channel.ack(message);
    }
  });
}

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
