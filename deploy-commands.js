require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Give a vouch")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true))
    .addStringOption(option =>
      option.setName("message").setDescription("Message").setRequired(true)),

  new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item")
    .addStringOption(option =>
      option.setName("item").setDescription("Item").setRequired(true))
    .addStringOption(option =>
      option.setName("price").setDescription("Price (e.g. 500k, 2m)").setRequired(true)),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⏳ Deploying V4 commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ V4 commands deployed");
  } catch (err) {
    console.error(err);
  }
})();
