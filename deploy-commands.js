const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [

  new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item")
    .addStringOption(o => o.setName("item").setDescription("Item").setRequired(true))
    .addStringOption(o => o.setName("price").setDescription("Price").setRequired(true)),

  new SlashCommandBuilder()
    .setName("listings")
    .setDescription("Show all listings"),

  new SlashCommandBuilder()
    .setName("trade")
    .setDescription("Create a trade")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
    .addStringOption(o => o.setName("item").setDescription("Item").setRequired(true))
    .addStringOption(o => o.setName("price").setDescription("Price").setRequired(true)),

  new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Vouch for a user")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
    .addStringOption(o => o.setName("message").setDescription("Message").setRequired(true)),

  new SlashCommandBuilder()
    .setName("rep")
    .setDescription("Check reputation")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Market stats")

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("✅ V2 commands deployed");
})();
