require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const VOUCH_CHANNEL = process.env.VOUCH_CHANNEL_ID;
const AUCTION_CHANNEL = process.env.AUCTION_CHANNEL_ID;

// 🚀 BOT START
client.once("ready", () => {
  console.log(`🔥 Sulie Bot V3 online as ${client.user.tag}`);
  console.log("ENV VOUCH:", process.env.VOUCH_CHANNEL_ID);
});


// 🎮 INTERACTIONS
client.on("interactionCreate", async (interaction) => {

  // =======================
  // 💬 SLASH COMMANDS
  // =======================
  if (interaction.isChatInputCommand()) {

    // ⭐ VOUCH
    if (interaction.commandName === "vouch") {
      try {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");
        const message = interaction.options.getString("message");

        const embed = new EmbedBuilder()
          .setTitle("⭐ New Vouch")
          .setDescription(`${interaction.user} vouched for ${user}\n\n"${message}"`)
          .setColor("Green")
          .setTimestamp();

        const channel = await client.channels.fetch(VOUCH_CHANNEL);
        await channel.send({ embeds: [embed] });

        await interaction.editReply("✅ Vouch sent!");
      } catch (err) {
        console.error(err);
        await interaction.editReply("❌ Error sending vouch!");
      }
    }

    // 🛒 SELL
    if (interaction.commandName === "sell") {
      try {
        await interaction.deferReply({ ephemeral: true });

        const item = interaction.options.getString("item");
        const price = interaction.options.getInteger("price");

        const embed = new EmbedBuilder()
          .setTitle("🛒 New Auction")
          .setDescription(`**Item:** ${item}\n**Price:** ${price}\n**Seller:** ${interaction.user}`)
          .setColor("Blue")
          .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`buy_${interaction.user.id}`)
            .setLabel("💰 Buy Now")
            .setStyle(ButtonStyle.Success)
        );

        const channel = await client.channels.fetch(AUCTION_CHANNEL);
        await channel.send({ embeds: [embed], components: [button] });

        await interaction.editReply("✅ Item listed in auction!");
      } catch (err) {
        console.error(err);
        await interaction.editReply("❌ Error listing item!");
      }
    }
  }

  // =======================
  // 🔘 BUY BUTTON
  // =======================
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("buy_")) {
      try {
        const sellerId = interaction.customId.split("_")[1];
        const buyer = interaction.user;
        const seller = await client.users.fetch(sellerId);

        // 📩 DM BUYER
        await buyer.send(
          `🛒 You bought an item!\n\n👉 Open a ticket and ping ${seller}\n👉 Continue the trade there`
        );

        // 📩 DM SELLER
        await seller.send(
          `💰 Your item was bought!\n\n👉 Open a ticket and ping ${buyer}\n👉 Continue the trade there`
        );

        await interaction.reply({
          content: "✅ Check your DMs to continue the trade!",
          ephemeral: true
        });

      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: "⚠️ Could not send DM. Make sure DMs are open!",
          ephemeral: true
        });
      }
    }
  }
});

// 🔐 LOGIN
client.login(process.env.DISCORD_TOKEN);
