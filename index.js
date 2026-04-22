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
    GatewayIntentBits.GuildMembers // Nodig voor rollen aanpassen!
  ]
});

// 🔥 GECOMBINEERDE CONFIGURATIE
const VOUCH_CHANNEL = process.env.VOUCH_CHANNEL_ID;
const AUCTION_CHANNEL = process.env.AUCTION_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

// 🔥 GECOMBINEERDE STATUS LIJST
const statuses = [
  "💰 Sulie Market",
  "🛒 Trading deals",
  "🎉 Giveaways live",
  "📊 Managing loans",
  "🔥 DSMP Marketplace",
  "👑 Managing staff"
];

// 💰 PRICE PARSER (500k / 2m support)
function parsePrice(input) {
  if (!input) return 0;
  input = input.toLowerCase();
  if (input.endsWith("k")) return parseInt(input) * 1000;
  if (input.endsWith("m")) return parseInt(input) * 1000000;
  return parseInt(input);
}

// 🚀 READY EVENT + DYNAMIC STATUS
client.once("ready", () => {
  console.log(`🔥 Sulie Bot V4 online as ${client.user.tag}`);

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

    // ⭐ VOUCH (Publiek)
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

    // 🛒 SELL (Publiek)
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
        await interaction.editReply("✅ Auction created!");
      } catch (err) {
        console.error(err);
        await interaction.editReply("❌ Error creating auction!");
      }
    }

    // 🟢 PROMOTE (Staff Only)
    if (interaction.commandName === "promote") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({ content: "❌ Staff only!", ephemeral: true });
      }

      const user = interaction.options.getUser("user");
      const role = interaction.options.getRole("role");
      const reason = interaction.options.getString("reason") || "No reason provided";
      const member = await interaction.guild.members.fetch(user.id);
      const oldRole = member.roles.highest;

      await member.roles.add(role);

      const embed = new EmbedBuilder()
        .setColor("#00ff88")
        .setTitle("✨ STAFF PROMOTION ✨")
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "👤 Name", value: `${user}`, inline: true },
          { name: "⬆️ New Role", value: `${role}`, inline: true },
          { name: "⬇️ Old Role", value: `${oldRole}`, inline: true },
          { name: "📝 Reason", value: `\`\`\`${reason}\`\`\`` }
        )
        .setFooter({ text: `Promoted by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });
    }

    // 🔴 DEMOTE (Staff Only)
    if (interaction.commandName === "demote") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({ content: "❌ Staff only!", ephemeral: true });
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
  // 2. BUTTONS (Buy/Confirm/Cancel)
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
          .setDescription(`Buyer: ${buyer}\nSeller: ${seller}\nPrice: ${price}\n\nOpen a ticket and complete the trade safely.`)
          .setColor("Red");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`confirm_${sellerId}_${buyer.id}`).setLabel("✅ Confirm Trade").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`cancel_${sellerId}_${buyer.id}`).setLabel("❌ Cancel").setStyle(ButtonStyle.Danger)
        );

        await buyer.send({ embeds: [embed], components: [row] });
        await seller.send({ embeds: [embed], components: [row] });

        await interaction.reply({ content: "📩 Check your DMs!", ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: "❌ Could not send DMs", ephemeral: true });
      }
    }

    if (interaction.customId.startsWith("confirm_")) {
      await interaction.reply({ content: "✅ Trade confirmed! Open a ticket to complete it.", ephemeral: true });
    }

    if (interaction.customId.startsWith("cancel_")) {
      await interaction.reply({ content: "❌ Trade cancelled.", ephemeral: true });
    }
  }
});

// 🔐 LOGIN
client.login(process.env.DISCORD_TOKEN);
