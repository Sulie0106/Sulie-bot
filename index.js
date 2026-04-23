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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.MessageContent
  ]
});

// 🛠️ CONFIGURATION
const MY_ID = "1453824331346874500"; // Your unique ID
const VOUCH_CHANNEL = process.env.VOUCH_CHANNEL_ID;
const AUCTION_CHANNEL = process.env.AUCTION_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

// 🔥 STATUS LIST
const statuses = [
  "💰 Sulie Market",
  "🛒 Trading deals",
  "🎉 Giveaways live",
  "📊 Managing Server",
  "🔥 DSMP Marketplace",
  "👑 Admin: Mrsulie"
];

// 💰 PRICE PARSER (500k / 2m support)
function parsePrice(input) {
  if (!input) return 0;
  input = input.toLowerCase();
  if (input.endsWith("k")) return parseInt(input) * 1000;
  if (input.endsWith("m")) return parseInt(input) * 1000000;
  return parseInt(input);
}

// 🚀 BOT START
client.once("ready", () => {
  console.log(`✅ Sulie Bot is online as ${client.user.tag}`);

  let i = 0;
  setInterval(() => {
    client.user.setPresence({
      activities: [{ name: statuses[i], type: 0 }],
      status: "online"
    });
    i = (i + 1) % statuses.length;
  }, 5000);
});

// 🎮 INTERACTIONS HANDLER
client.on("interactionCreate", async (interaction) => {

  // ======================
  // 1. SLASH COMMANDS
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
          .setDescription(`${interaction.user} has vouched for ${user}\n\n"${message}"`)
          .setColor("Green")
          .setTimestamp();

        const channel = await client.channels.fetch(VOUCH_CHANNEL);
        await channel.send({ embeds: [embed] });
        await interaction.editReply("✅ Your vouch has been sent!");
      } catch (err) {
        console.error(err);
        await interaction.editReply("❌ Something went wrong while sending the vouch.");
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
          .setDescription(`**Item:** ${item}\n**Price:** ${price.toLocaleString()} coins\n**Seller:** ${interaction.user}`)
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
        await interaction.editReply("✅ Your item is now listed for sale!");
      } catch (err) {
        console.error(err);
        await interaction.editReply("❌ Error creating the auction.");
      }
    }

    // 🟢 PROMOTE (OWNER ONLY)
    if (interaction.commandName === "promote") {
      if (interaction.user.id !== MY_ID) {
        return interaction.reply({ content: "❌ Only the owner can use this command!", ephemeral: true });
      }

      const user = interaction.options.getUser("user");
      const role = interaction.options.getRole("role");
      const reason = interaction.options.getString("reason") || "No reason provided";
      const member = await interaction.guild.members.fetch(user.id);

      await member.roles.add(role);

      const embed = new EmbedBuilder()
        .setColor("#00ff88")
        .setTitle("✨ STAFF PROMOTION ✨")
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "👤 Name", value: `${user}`, inline: true },
          { name: "⬆️ New Role", value: `${role}`, inline: true },
          { name: "📝 Reason", value: `\`\`\`${reason}\`\`\`` }
        )
        .setFooter({ text: `Promoted by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });
    }

    // 🔴 DEMOTE (OWNER ONLY)
    if (interaction.commandName === "demote") {
      if (interaction.user.id !== MY_ID) {
        return interaction.reply({ content: "❌ Only the owner can use this command!", ephemeral: true });
      }

      const user = interaction.options.getUser("user");
      const role = interaction.options.getRole("role");
      const reason = interaction.options.getString("reason") || "No reason provided";
      const member = await interaction.guild.members.fetch(user.id);

      await member.roles.remove(role);

      const embed = new EmbedBuilder()
        .setColor("#ff0033")
        .setTitle("⚠️ STAFF DEMOTION ⚠️")
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "👤 Name", value: `${user}`, inline: true },
          { name: "❌ Removed Role", value: `${role}`, inline: true },
          { name: "📝 Reason", value: `\`\`\`${reason}\`\`\`` }
        )
        .setFooter({ text: `Demoted by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });
    }
  }

  // ======================
  // 2. BUTTONS HANDLER
  // ======================
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("buy_")) {
      await interaction.reply({ content: "📩 Check your DMs to finalize the trade!", ephemeral: true });
      // Note: You can add more button logic here if needed (confirm/cancel)
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
