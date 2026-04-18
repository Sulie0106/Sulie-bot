require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const VOUCH_CHANNEL = process.env.VOUCH_CHANNEL_ID;
const AUCTION_CHANNEL = process.env.AUCTION_CHANNEL_ID;

client.once("ready", () => {
  console.log(`🔥 Sulie Bot V3 online as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {

    // ⭐ VOUCH
    if (interaction.commandName === "vouch") {
      const user = interaction.options.getUser("user");
      const message = interaction.options.getString("message");

      const embed = new EmbedBuilder()
        .setTitle("⭐ New Vouch")
        .setDescription(`${interaction.user} vouched for ${user}\n\n"${message}"`)
        .setColor("Green");

      const channel = await client.channels.fetch(VOUCH_CHANNEL);
      channel.send({ embeds: [embed] });

      await interaction.reply({ content: "✅ Vouch sent!", ephemeral: true });
    }

    // 🛒 SELL
    if (interaction.commandName === "sell") {
      const item = interaction.options.getString("item");
      const price = interaction.options.getInteger("price");

      const embed = new EmbedBuilder()
        .setTitle("🛒 New Auction")
        .setDescription(`**Item:** ${item}\n**Price:** ${price}\nSeller: ${interaction.user}`)
        .setColor("Blue");

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_${interaction.user.id}`)
          .setLabel("💰 Buy Now")
          .setStyle(ButtonStyle.Success)
      );

      const channel = await client.channels.fetch(AUCTION_CHANNEL);
      await channel.send({ embeds: [embed], components: [button] });

      await interaction.reply({ content: "✅ Listed in auction!", ephemeral: true });
    }
  }

  // 🔘 BUY BUTTON
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("buy_")) {
      const sellerId = interaction.customId.split("_")[1];
      const buyer = interaction.user;
      const seller = await client.users.fetch(sellerId);

      // DM buyer
      await buyer.send(`🛒 You bought an item!\n👉 Open a ticket and ping ${seller}`);

      // DM seller
      await seller.send(`💰 Your item was bought!\n👉 Open a ticket and ping ${buyer}`);

      await interaction.reply({
        content: "✅ Check your DMs to continue the trade!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
