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

// 🔐 Channels
const VOUCH_CHANNEL = process.env.VOUCH_CHANNEL_ID;
const AUCTION_CHANNEL = process.env.AUCTION_CHANNEL_ID;

// 🚀 Ready
client.once("ready", () => {
  console.log(`🔥 Sulie Bot V3 online as ${client.user.tag}`);

  console.log("VOUCH CHANNEL:", VOUCH_CHANNEL);
  console.log("AUCTION CHANNEL:", AUCTION_CHANNEL);
});

// 🎮 Interactions
client.on("interactionCreate", async (interaction) => {

  // ======================
  // SLASH COMMANDS
  // ======================
  if (interaction.isChatInputCommand()) {

    // ⭐ VOUCH
    if (interaction.commandName === "vouch") {
      try {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");
        const message = interaction.options.getString("message");

        if (!VOUCH_CHANNEL) {
          return interaction.editReply("❌ Vouch channel not set in .env");
        }

        const channel = await client.channels.fetch(VOUCH_CHANNEL);

        if (!channel) {
          return interaction.editReply("❌ Vouch channel not found");
        }

        const embed = new EmbedBuilder()
          .setTitle("⭐ New Vouch")
          .setDescription(`${interaction.user} vouched for ${user}\n\n"${message}"`)
          .setColor("Green")
          .setTimestamp();

        await channel.send({ embeds: [embed] });

        await interaction.editReply("✅ Vouch sent!");
      } catch (err) {
        console.error("VOUCH ERROR:", err);
        await interaction.editReply("❌ Error sending vouch!");
      }
    }

    // 🛒 SELL
    if (interaction.commandName === "sell") {
      try {
        await interaction.deferReply({ ephemeral: true });

        const item = interaction.options.getString("item");
        const price = interaction.options.getInteger("price");

        if (!AUCTION_CHANNEL) {
          return interaction.editReply("❌ Auction channel not set in .env");
        }

        const embed = new EmbedBuilder()
          .setTitle("🛒 New Auction")
          .setDescription(
            `**Item:** ${item}\n**Price:** ${price}\n**Seller:** ${interaction.user}`
          )
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

        await interaction.editReply("✅ Item listed!");
      } catch (err) {
        console.error("SELL ERROR:", err);
        await interaction.editReply("❌ Error listing item!");
      }
    }
  }

  // ======================
  // BUY BUTTON
  // ======================
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("buy_")) {
      try {
        const sellerId = interaction.customId.split("_")[1];
        const buyer = interaction.user;
        const seller = await client.users.fetch(sellerId);

        await buyer.send(
          `🛒 You bought an item!\n👉 Open a ticket and ping ${seller}`
        );

        await seller.send(
          `💰 Your item was bought!\n👉 Open a ticket and ping ${buyer}`
        );

        await interaction.reply({
          content: "✅ Check your DMs!",
          ephemeral: true
        });

      } catch (err) {
        console.error("BUY ERROR:", err);
        await interaction.reply({
          content: "❌ Could not send DMs (maybe closed).",
          ephemeral: true
        });
      }
    }
  }
});

// 🔐 Login
client.login(process.env.DISCORD_TOKEN);
