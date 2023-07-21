const { ChatInputCommandInteraction, ChatInputApplicationCommandData, AutocompleteInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { CustomColors } = require("../../constants.js");
const { GuildXp, GuildConfig } = require("../../Mongoose/Models.js");
const { abbreviateNumber } = require("../../BotModules/Utility.js");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "top",

    // Command's Description
    Description: `View the top 10 Members with the highest XP count in this Server`,

    // Command's Category
    Category: "GENERAL",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 15,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "example": 3
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",
    
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
        Data.dmPermission = false;
        Data.options = [
            {
                type: ApplicationCommandOptionType.String,
                name: "xp_type",
                description: "Type of XP to show the Top 10 for",
                required: true,
                choices: [
                    { name: `Text XP`, value: `TEXT` },
                    { name: `Voice XP`, value: `VOICE` }
                ]
            }
        ];

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} slashCommand 
     */
    async execute(slashCommand)
    {
        await slashCommand.deferReply({ ephemeral: true });

        // Fetch Input
        const InputXpType = slashCommand.options.getString("xp_type", true);

        // Fetch Guild Config for checking XP systems haven't been disabled
        const GuildSettings = await GuildConfig.findOne({ guildId: slashCommand.guildId });

        // Fetch top 10 Members based off XP type
        let fetchedXpCollection;
        
        if ( InputXpType === "TEXT" )
        {
            // Make sure Text XP System hasn't been disabled
            if ( !GuildSettings.textXp )
            {
                await slashCommand.editReply({ content: `Sorry, but the Text XP System has been disabled for this Server by this Server's Admins!` });
                return;
            }

            fetchedXpCollection = await GuildXp.find({ guildId: slashCommand.guildId }).sort({ textXp: "desc" }).limit(10);
        }
        else if ( InputXpType === "VOICE" )
        {
            // Make sure Voice XP System hasn't been disabled
            if ( !GuildSettings.voiceXp )
            {
                await slashCommand.editReply({ content: `Sorry, but the Voice XP System has been disabled for this Server by this Server's Admins!` });
                return;
            }

            fetchedXpCollection = await GuildXp.find({ guildId: slashCommand.guildId }).sort({ voiceXp: "desc" }).limit(10);
        }


        // Arrange into readable format for Embed
        let readableTopString = "";
        fetchedXpCollection.forEach(xpEntry => {
            readableTopString += `- <@${xpEntry.userId}>\_\_\_\_${InputXpType === "TEXT" ? abbreviateNumber(xpEntry.textXp) : abbreviateNumber(xpEntry.voiceXp)} xp\n`;
        });


        // Construct Embed
        const TopEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
        .setTitle(`Top 10 Members for ${slashCommand.guild.name}`)
        .setDescription(`**By ${InputXpType === "TEXT" ? "Text" : "Voice"} XP\n\n${readableTopString}**`)
        .setThumbnail(slashCommand.guild.iconURL());

        await slashCommand.editReply({ embeds: [TopEmbed] });
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
