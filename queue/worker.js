require("dotenv").config();
const amqp = require("amqplib");
const axios = require("axios");

const RABBITMQ_URL = process.env.RABBITMQ_URL;

const startWorker = async () => {
  const rabbitMqConnection = await amqp.connect(RABBITMQ_URL);
  let channel;

  try {
    channel = await rabbitMqConnection.createChannel();
    await channel.assertQueue("email-queue");
    channel.prefetch(1);

    channel.consume("email-queue", async (message) => {
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
        console.error(`[QUEUE] Failed to send email`, error.message);
        channel.nack(message, false, true);
      }
    });
  } catch (error) {
    console.error(`[QUEUE] Channel error: ${error.message}`);
  }

  rabbitMqConnection.on("error", (error) => {
    console.error(`[QUEUE] Connection error: ${error.message}`);
  });

  rabbitMqConnection.on("close", () => {
    console.log("[QUEUE] Connection closed");

    // Attempt to re-establish the channel if it was closed unexpectedly
    setTimeout(() => {
      console.log("[QUEUE] Reconnecting...");
      startWorker();
    }, 5000);
  });
};


// const startWorker = async () => {
//   const rabbitMqConnection = await amqp.connect(RABBITMQ_URL);
//   const channel = await rabbitMqConnection.createChannel();
//   await channel.assertQueue("email-queue");

//   channel.prefetch(1);

//   while (true) {
//     const message = await channel.get("email-queue");
//     if (message) {
//       console.log(`[QUEUE] Processing email for ${message.content.toString()}`);

//       try {
//         const emailMessage = JSON.parse(message.content.toString());
//         const response = await axios.post(
//           "https://email-service.digitalenvision.com.au/send-email",
//           emailMessage
//         );
//         console.log(`[QUEUE] Success ${emailMessage.message}`, response.data);

//         channel.ack(message);
//       } catch (error) {
//         console.error(`[QUEUE] Failed to send email`, error.message);
//         channel.nack(message, false, true);
//       }

//     } else {
//       // no more messages in the queue, close channel and connection
//       await channel.close();
//       await rabbitMqConnection.close();
//       console.log("No more messages in queue");

//       // wait for a short time before checking for new messages again
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   }
// };

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
