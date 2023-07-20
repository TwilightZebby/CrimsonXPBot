const { ChatInputCommandInteraction, ChatInputApplicationCommandData, AutocompleteInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { CustomColors, CrimsonEmojis, StaticStrings, CrimsonUris } = require("../../constants.js");
const { UserConfig } = require("../../Mongoose/Models.js");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "preferences",

    // Command's Description
    Description: `View or Manage your CrimsonXP Preferences`,

    // Command's Category
    Category: "MANAGEMENT",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 30,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "view": 15,
        "edit": 30,
        "background_rank": 30,
        "background_broadcast": 30
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "ALL",
    
    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "view": "ALL",
        "edit": "ALL",
        "background_rank": "ALL",
        "background_broadcast": "ALL"
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
        Data.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "view",
                description: "View your current preferences for CrimsonXP"
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "edit",
                description: "Change your CrimsonXP Preferences",
                options: [
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "broadcast_mentions",
                        description: "Should CrimsonXP @ping you when you Level up/down in Servers? [DEFAULT: False]"
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: "background",
                description: "Manage backgrounds for your Rank Card & Broadcast Card",
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "rank",
                        description: "Manage the background for your Rank Card"
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "broadcast",
                        description: "Manage the background for your Broadcast Card"
                    }
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
        const subcommandName = slashCommand.options.getSubcommand();
        const subcommandGroup = slashCommand.options.getSubcommandGroup();

        if ( subcommandName === "view" ) { await viewPreferences(slashCommand); }
        else if ( subcommandName === "edit" ) { await editPreferences(slashCommand); }
        else if ( subcommandGroup === "background" && subcommandName === "rank" ) { await editRankCard(slashCommand); }
        else if ( subcommandGroup === "background" && subcommandName === "broadcast" ) { await editBroadcastCard(slashCommand); }

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






/**
* Grabs & Displays the current preferences for the User
* @param {ChatInputCommandInteraction} slashCommand 
*/
async function viewPreferences(slashCommand)
{
    await slashCommand.deferReply({ ephemeral: true });

    // Fetch Data
    let userPreferences;

    if ( await UserConfig.exists({ userId: slashCommand.user.id }) == null )
    {
        userPreferences = await UserConfig.create({ userId: slashCommand.user.id });
    }
    else
    {
        userPreferences = await UserConfig.findOne({ userId: slashCommand.user.id });
    }

    const PreferenceEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
    .setTitle(`Preferences for ${slashCommand.user.username}`)
    .setDescription(`- *To edit your general Preferences, use </preferences edit:${slashCommand.commandId}>*
- *To edit your Rank Card, use </preferences background rank:${slashCommand.commandId}>*
- *To edit your Broadcast Card, use </preferences background broadcast:${slashCommand.commandId}>*`)
    .addFields(
        { name: `Mentioned in Broadcasts`, value: `${userPreferences.broadcastMentions ? `${CrimsonEmojis.GreenTick} Enabled` : `${CrimsonEmojis.RedX} Disabled`}` },
        { name: `Rank Card Background`, value: `${userPreferences.cardBackground === "DISABLE" ? `None` : userPreferences.cardBackground}` },
        { name: `Broadcast Card Background`, value: `${userPreferences.broadcastBackground === "DISABLE" ? `None` : userPreferences.broadcastBackground}` }
    );

    // ACK
    await slashCommand.editReply({ embeds: [PreferenceEmbed] });

    return;
}






/**
* Edits the User's Preferences
* @param {ChatInputCommandInteraction} slashCommand 
*/
async function editPreferences(slashCommand)
{
    await slashCommand.deferReply({ ephemeral: true });

    // Fetch Inputs
    const updateMentions = slashCommand.options.getBoolean("broadcast_mentions");

    // Ensure at least once input was actually given
    if ( updateMentions == null )
    {
        await slashCommand.editReply({ content: `Sorry, but you didn't provide any new Preferences to update!` });
        return;
    }

    // Fetch Data
    let userPreferences;

    if ( await UserConfig.exists({ userId: slashCommand.user.id }) == null )
    {
        userPreferences = await UserConfig.create({ userId: slashCommand.user.id });
    }
    else
    {
        userPreferences = await UserConfig.findOne({ userId: slashCommand.user.id });
    }

    
    // For Embed to ACK back to User
    const EditEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
    .setTitle(`Edited Preferences for ${slashCommand.user.username}`)
    .setDescription(`- *To view all your Preferences, use </preferences view:${slashCommand.commandId}>*`);


    if ( updateMentions != null )
    {
        userPreferences.broadcastMentions = updateMentions;
        EditEmbed.addFields({ name: `Mentioned in Broadcasts`, value: `${updateMentions ? `${CrimsonEmojis.GreenTick} Enabled` : `${CrimsonEmojis.RedX} Disabled`}` });
    }


    // Update & Save to Database
    await userPreferences.save()
    .catch(async err => {
        await slashCommand.editReply({ content: `${CrimsonEmojis.Warning} **ERROR:** Failed to save changes to your Preferences.\nPlease try again, if this error contiunes, please let us know in [CrimsonXP's Support Server](${CrimsonUris.SupportServerInvite})!` });
        return;
    })
    .then(async editedPreferencesEntry => {
        await slashCommand.editReply({ embeds: [EditEmbed] });
    });

    return;
}






/**
* Starts the editing process for editing the User's Rank Card
* @param {ChatInputCommandInteraction} slashCommand 
*/
async function editRankCard(slashCommand)
{
    // Placeholder for now
    await slashCommand.reply({ ephemeral: true, content: StaticStrings.CommandNotImplemented });
    return;
}







/**
* Starts the editing process for editing the User's Broadcast Card
* @param {ChatInputCommandInteraction} slashCommand 
*/
async function editBroadcastCard(slashCommand)
{
    // Placeholder for now
    await slashCommand.reply({ ephemeral: true, content: StaticStrings.CommandNotImplemented });
    return;
}
