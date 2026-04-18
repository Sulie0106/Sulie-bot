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
    .addIntegerOption(option =>
      option.setName("price").setDescription("Price").setRequired(true)),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("✅ V3 commands deployed");
})();
