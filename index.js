const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// simple in-memory storage (upgrade later to MongoDB)
const listings = [];
const trades = [];
const vouches = [];

client.on("ready", () => {
  console.log(`✅ Sulie Bot V2 online as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  // 🛒 SELL
  if (cmd === "sell") {
    const item = interaction.options.getString("item");
    const price = interaction.options.getString("price");

    const listing = {
      id: listings.length + 1,
      item,
      price,
      seller: interaction.user.tag
    };

    listings.push(listing);

    return interaction.reply(`🛒 Listed **${item}** for **${price}** (ID: ${listing.id})`);
  }

  // 📦 LISTINGS
  if (cmd === "listings") {
    if (!listings.length) return interaction.reply("📭 No listings yet.");

    return interaction.reply(
      listings.map(l => `#${l.id} 📦 ${l.item} - 💰 ${l.price} | 👤 ${l.seller}`).join("\n")
    );
  }

  // 🤝 TRADE
  if (cmd === "trade") {
    const user = interaction.options.getUser("user");
    const item = interaction.options.getString("item");
    const price = interaction.options.getString("price");

    const trade = {
      id: trades.length + 1,
      buyer: interaction.user.tag,
      seller: user.tag,
      item,
      price,
      status: "pending"
    };

    trades.push(trade);

    return interaction.reply(`🤝 Trade created (#${trade.id}) between **${trade.buyer}** and **${trade.seller}**`);
  }

  // ⭐ VOUCH
  if (cmd === "vouch") {
    const user = interaction.options.getUser("user");
    const msg = interaction.options.getString("message");

    vouches.push({ user: user.tag, msg });

    return interaction.reply(`⭐ Vouch added for **${user.tag}**`);
  }

  // 📊 REP
  if (cmd === "rep") {
    const user = interaction.options.getUser("user");

    const count = vouches.filter(v => v.user === user.tag).length;

    let level = "LOW 🔴";
    if (count > 5) level = "MEDIUM 🟡";
    if (count > 15) level = "HIGH 🟢";

    return interaction.reply(`📊 **${user.tag}**
⭐ Vouches: ${count}
Trust: ${level}`);
  }

  // 📊 STATS
  if (cmd === "stats") {
    return interaction.reply(
      `📊 **Sulie Market Stats**\n🛒 Listings: ${listings.length}\n🤝 Trades: ${trades.length}\n⭐ Vouches: ${vouches.length}`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
