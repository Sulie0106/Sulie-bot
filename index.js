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

// 💰 PRICE PARSER (500k / 2m support)
function parsePrice(input) {
  if (!input) return 0;

  input = input.toLowerCase();

  if (input.endsWith("k")) return parseInt(input) * 1000;
  if (input.endsWith("m")) return parseInt(input) * 1000000;

  return parseInt(input);
}

// 🚀 READY
client.once("ready", () => {
  console.log(`🔥 Sulie Bot V4 online as ${client.user.tag}`);
});

// 🎮 INTERACTIONS
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
        const priceInput = interaction.options.getString("price");
        const price = parsePrice(priceInput);

        const embed = new EmbedBuilder()
          .setTitle("🛒 NEW AUCTION")
          .setDescription(
            `**Item:** ${item}\n**Price:** ${price.toLocaleString()} coins\n**Seller:** ${interaction.user}`
          )
          .setColor("Blue")
          .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`buy_${interaction.user.id}_${price}`)
            .setLabel("💰 Buy Now")
            .setStyle(ButtonStyle.Success)
        );

        const channel = await client.channels.fetch(AUCTION_CHANNEL);
        await channel.send({ embeds: [embed], components: [button] });

        await interaction.editReply("✅ Auction created!");
      } catch (err) {
        console.error(err);
        await interaction.editReply("❌ Error creating auction!");
      }
    }
  }

  // ======================
  // BUY BUTTON
  // ======================
  if (interaction.isButton()) {

    if (interaction.customId.startsWith("buy_")) {
      try {
        const parts = interaction.customId.split("_");
        const sellerId = parts[1];
        const price = parts[2];

        const buyer = interaction.user;
        const seller = await client.users.fetch(sellerId);

        const embed = new EmbedBuilder()
          .setTitle("⚠️ TRADE CONFIRMATION")
          .setDescription(
            `Buyer: ${buyer}\nSeller: ${seller}\nPrice: ${price}\n\nOpen a ticket and complete the trade safely.`
          )
          .setColor("Red");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_${sellerId}_${buyer.id}`)
            .setLabel("✅ Confirm Trade")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId(`cancel_${sellerId}_${buyer.id}`)
            .setLabel("❌ Cancel")
            .setStyle(ButtonStyle.Danger)
        );

        await buyer.send({ embeds: [embed], components: [row] });
        await seller.send({ embeds: [embed], components: [row] });

        await interaction.reply({
          content: "📩 Check your DMs!",
          ephemeral: true
        });

      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: "❌ Could not send DMs",
          ephemeral: true
        });
      }
    }

    // ✅ CONFIRM
    if (interaction.customId.startsWith("confirm_")) {
      await interaction.reply({
        content: "✅ Trade confirmed! Open a ticket to complete it.",
        ephemeral: true
      });
    }

    // ❌ CANCEL
    if (interaction.customId.startsWith("cancel_")) {
      await interaction.reply({
        content: "❌ Trade cancelled.",
        ephemeral: true
      });
    }
  }
});

// 🔐 LOGIN
client.login(process.env.DISCORD_TOKEN);
