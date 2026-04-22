require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

// Hier worden alle commando's verzameld
const commands = [
  // Het "Sell" commando uit je eerste code
  new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item")
    .addStringOption(option =>
      option.setName("item").setDescription("The item you want to sell").setRequired(true))
    .addIntegerOption(option =>
      option.setName("price_amount").setDescription("Price in numbers (e.g. 500000)").setRequired(true))
    .addStringOption(option =>
      option.setName("price_text").setDescription("Price in text (e.g. 500k, 2m)").setRequired(true)),

  // Het "Promote" commando uit je tweede code
  new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promote a staff member")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true))
    .addRoleOption(o =>
      o.setName("role").setDescription("New role").setRequired(true))
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason").setRequired(false)),

  // Het "Demote" commando uit je tweede code
  new SlashCommandBuilder()
    .setName("demote")
    .setDescription("Demote a staff member")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true))
    .addRoleOption(o =>
      o.setName("role").setDescription("Role to remove").setRequired(true))
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason").setRequired(false)),

].map(cmd => cmd.toJSON());

// Initialiseer de REST client
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// De functie om de commando's te uploaden naar Discord
(async () => {
  try {
    console.log("⏳ Start: Commando's uploaden naar Discord...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Succes: Alle commando's (sell, promote, demote) zijn geregistreerd!");
  } catch (error) {
    console.error("❌ Fout bij het laden van commando's:");
    console.error(error);
  }
})();
