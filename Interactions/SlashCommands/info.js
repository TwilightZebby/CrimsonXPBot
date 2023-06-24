const { ChatInputCommandInteraction, ChatInputApplicationCommandData, AutocompleteInteraction, ApplicationCommandType, EmbedBuilder } = require("discord.js");
const { DiscordClient, Collections, CustomColors } = require("../../constants.js");
const { version, dependencies } = require('../../package.json');

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "info",

    // Command's Description
    Description: `See information about CrimsonXP, including links to my support server & changelogs!`,

    // Command's Category
    Category: "GENERAL",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 10,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "example": 3
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "ALL",
    
    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "example": "GUILD"
    },



    /**
     * Returns data needed for registering Slash Command onto Discord's API
     * @returns {ChatInputApplicationCommandData}
     */
    registerData()
    {
        /** @type {ChatInputApplicationCommandData} */
        const Data = {};

        Data.name = this.Name;
        Data.description = this.Description;
        Data.type = ApplicationCommandType.ChatInput;
        Data.dmPermission = true;

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} slashCommand 
     */
    async execute(slashCommand)
    {
        // Create Embed
        let infoEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
        .setTitle(`${DiscordClient.user.username} Information`)
        .setDescription(`A highly customisable, and free, Levelling Bot for your Discord Servers.`)
        .setThumbnail("https://i.imgur.com/JlAQDef.png")
        .addFields({
            name: `Bot's Developer`,
            value: `TwilightZebby`,
            inline: true
        }, {
            name: `Bot's Version`,
            value: `${version}`,
            inline: true
        }, {
            name: `Discord.JS Version`,
            value: `${dependencies["discord.js"]}`,
            inline: true
        }, {
            name: `Server Count`,
            value: `Around ${DiscordClient.guilds.cache.size}`,
            inline: true
        });

        // ACK to User
        await slashCommand.reply({ ephemeral: true, embeds: [infoEmbed] });
        return;
    },



    /**
     * Handles given Autocomplete Interactions for any Options in this Slash CMD that uses it
     * @param {AutocompleteInteraction} autocompleteInteraction 
     */
    async autocomplete(autocompleteInteraction)
    {
        //.
    }
}
