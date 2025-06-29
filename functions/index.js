const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();
const db = admin.firestore();

const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");

exports.telegramWebhook = onRequest({ secrets: [TELEGRAM_BOT_TOKEN] }, async (request, response) => {
  const TelegramBot = require("node-telegram-bot-api");
  const botToken = TELEGRAM_BOT_TOKEN.value();

  if (!botToken) {
    functions.logger.error("Error: Token del bot no disponible.");
    response.status(500).send("Error interno: Token del bot no configurado.");
    return;
  }

  const bot = new TelegramBot(botToken, { polling: false });

  try {
    const update = request.body;
    functions.logger.info("Received Telegram update:", update);

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const username = update.message.from.username || update.message.from.first_name;
      const allowedChatIds = ["202937966"];

      if (!allowedChatIds.includes(chatId.toString())) {
        await bot.sendMessage(chatId, `Acceso denegado. Tu Chat ID (${chatId}) no está autorizado.`);
        response.status(200).send('Unauthorized');
        return;
      }

      switch (text) {
        case "/start":
          await bot.sendMessage(chatId, "🌱 ¡Hola! Soy *OreoInvertido*, tu sistema de riego de confianza. Comandos disponibles:\n\n" +
            "/humedad - Ver última humedad\n" +
            "/luz - Ver nivel de luz\n" +
            "/estado - Ver estado general\n" +
            "/regar - Activar riego\n\n" +
            "🧪 Además podés ver estadísticas detalladas tocando el botón abajo 👇", {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "📊 Ver estadísticas en la web",
                  url: "https://sriegosystem-oreoinvertido.web.app/"
                }
              ]]
            }
          });
          break;

        case "/humedad":
          try {
            const snapshot = await db.collection('mediciones').orderBy('timestamp', 'desc').limit(1).get();
            if (!snapshot.empty) {
              const data = snapshot.docs[0].data();
              const fecha = formatearFecha(data.timestamp);
              await bot.sendMessage(chatId, `💧 Humedad actual: ${data.humedad}%\n🕒 Última lectura: ${fecha}`);
            } else {
              await bot.sendMessage(chatId, "No hay lecturas de humedad aún.");
            }
          } catch (error) {
            await bot.sendMessage(chatId, "Error al obtener humedad.");
          }
          break;

        case "/luz":
          try {
            const snapshot = await db.collection('mediciones').orderBy('timestamp', 'desc').limit(1).get();
            if (!snapshot.empty) {
              const data = snapshot.docs[0].data();
              const fecha = formatearFecha(data.timestamp);
              await bot.sendMessage(chatId, `🌞 Luz actual: ${data.luz} Lux\n🕒 Última lectura: ${fecha}`);
            } else {
              await bot.sendMessage(chatId, "No hay lecturas de luz aún.");
            }
          } catch (error) {
            await bot.sendMessage(chatId, "Error al obtener luz.");
          }
          break;

        case "/regar":
          try {
            await db.collection('commands').add({
              commandType: 'regar',
              status: 'pending',
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              requesterChatId: chatId
            });
            await bot.sendMessage(chatId, "Regando la planta 🌱💧...");
          } catch (error) {
            await bot.sendMessage(chatId, "Error al enviar comando de riego.");
          }
          break;

        case "/estado":
          try {
            const snapshot = await db.collection('mediciones').orderBy('timestamp', 'desc').limit(1).get();
            if (!snapshot.empty) {
              const data = snapshot.docs[0].data();
              const humedad = data.humedad !== undefined ? `${data.humedad}%` : "N/A";
              const luz = data.luz !== undefined ? `${data.luz} Lux` : "N/A";
              const fecha = formatearFecha(data.timestamp);
              await bot.sendMessage(chatId, `📊 Estado de la planta:\n- 💧 Humedad: ${humedad}\n- 🌞 Luz: ${luz}\n- 🕒 Última lectura: ${fecha}`);
            } else {
              await bot.sendMessage(chatId, "No hay datos de estado aún.");
            }
          } catch (error) {
            await bot.sendMessage(chatId, "Error al obtener estado.");
          }
          break;
      }
    }

    response.status(200).send('OK');
  } catch (error) {
    functions.logger.error("Error general:", error);
    response.status(500).send('Internal Server Error');
  }
});

function formatearFecha(timestamp) {
  if (!timestamp || !timestamp.toDate) return "Desconocida";
  const date = timestamp.toDate();
  return date.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour12: false
  });
}

exports.setWebhook = onRequest({ secrets: [TELEGRAM_BOT_TOKEN] }, async (req, res) => {
  const TelegramBot = require("node-telegram-bot-api");
  const botToken = TELEGRAM_BOT_TOKEN.value();

  if (!botToken) {
    res.status(500).send("Error: Token del bot no disponible.");
    return;
  }

  const bot = new TelegramBot(botToken, { polling: false });
  const webhookUrl = `https://${process.env.GCLOUD_PROJECT}.cloudfunctions.net/telegramWebhook`;

  try {
    const success = await bot.setWebhook(webhookUrl);
    if (success) {
      res.status(200).send(`Webhook configurado en: ${webhookUrl}`);
    } else {
      res.status(500).send("Error al configurar webhook.");
    }
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Sincronizar datos de Realtime DB a Firestore
exports.syncSensorData = functions.database.ref('/sensorReadings/{pushId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.val();

    try {
      await db.collection('mediciones').add({
        humedad: data.humedad || null,
        luz: data.luz || null,
        timestamp: admin.firestore.Timestamp.now()
      });
      console.log("Dato sincronizado a Firestore. ✅");
    } catch (error) {
      console.error("Error al sincronizar ❌:", error);
    }
  });
