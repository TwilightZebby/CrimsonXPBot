const { ChatInputCommandInteraction, ChatInputApplicationCommandData, AutocompleteInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { CustomColors } = require("../../constants.js");
const { GuildXp, UserConfig, GuildConfig } = require("../../Mongoose/Models.js");
const { abbreviateNumber } = require("../../BotModules/Utility.js");
const { calculateLevel } = require("../../BotModules/Levelling/Levels.js");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "rank",

    // Command's Description
    Description: `View the XP & Levels of either yourself or another User`,

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
                type: ApplicationCommandOptionType.User,
                name: "user",
                description: "The User you want to view the Level of. If not included, defaults to yourself."
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
        const InputUser = slashCommand.options.getUser("user");
        let userXpData;
        let guildSettingsData;

        if ( InputUser == null )
        {
            // Default to User running the Command
            if ( await GuildXp.exists({ guildId: slashCommand.guildId, userId: slashCommand.user.id }) == null )
            {
                userXpData = await GuildXp.create({ guildId: slashCommand.guildId, userId: slashCommand.user.id });
            }
            else
            {
                userXpData = await GuildXp.findOne({ guildId: slashCommand.guildId, userId: slashCommand.user.id });
            }
        }
        else
        {
            // Make sure InputUser is a Human User!
            if ( InputUser.bot || InputUser.system )
            {
                await slashCommand.editReply({ content: `Sorry, but I don't support Bot or System Users in my XP systems!` });
                return;
            }

            // Fetch from User Inputted
            if ( await GuildXp.exists({ guildId: slashCommand.guildId, userId: InputUser.id }) == null )
            {
                userXpData = await GuildXp.create({ guildId: slashCommand.guildId, userId: InputUser.id });
            }
            else
            {
                userXpData = await GuildXp.findOne({ guildId: slashCommand.guildId, userId: InputUser.id });
            }
        }


        // Fetch Guild Settings to see which XP Systems are enabled
        if ( await GuildConfig.exists({ guildId: slashCommand.guildId }) == null ) { guildSettingsData = null; }
        else { guildSettingsData = await GuildConfig.findOne({ guildId: slashCommand.guildId }); }


        // Check if Background is set
        let userPreferenceData = null;
        if ( await UserConfig.exists({ userId: userXpData.userId }) != null )
        {
            userPreferenceData = await UserConfig.findOne({ userId: userXpData.userId });
        }


        // NO Card Backgrounds
        if ( userPreferenceData == null || userPreferenceData.cardBackground === "DISABLE" )
        {
            // Embed Time!
            const RankEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
            .setThumbnail(slashCommand.member.displayAvatarURL());

            // Add Fields only if those XP systems are enabled in the Server
            if ( guildSettingsData?.textXp === true )
            {
                RankEmbed.addFields(
                    { name: `Text Level`, value: `${calculateLevel(userXpData.textXp)}` },
                    { name: `Text XP`, value: `${abbreviateNumber(userXpData.textXp)}` }
                );
            }
            if ( guildSettingsData?.voiceXp === true )
            {
                RankEmbed.addFields(
                    { name: `Voice Level`, value: `${calculateLevel(userXpData.voiceXp)}` },
                    { name: `Voice XP`, value: `${abbreviateNumber(userXpData.voiceXp)}` }
                );
            }

            if ( InputUser != null ) { RankEmbed.setAuthor({ name: `XP Data for ${InputUser.username}` }); }
            else { RankEmbed.setAuthor({ name: `XP Data for ${slashCommand.user.username}` }); }

            await slashCommand.editReply({ embeds: [RankEmbed] });
            return;
        }
        else
        {
            await slashCommand.editReply({ content: `Sorry, but Background Support hasn't been added yet!` });
            return;
        }
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
