const { ChatInputCommandInteraction, ChatInputApplicationCommandData, AutocompleteInteraction, ApplicationCommandType, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType, EmbedBuilder } = require("discord.js");
const { DiscordClient, Collections, CustomColors, CrimsonEmojis, CrimsonUris } = require("../../constants.js");
const { GuildConfig } = require("../../Mongoose/Models.js");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "settings",

    // Command's Description
    Description: `View or edit this Bot's settings for this Server`,

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
        "role_add": 30,
        "role_remove": 30
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",
    
    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "view": "GUILD",
        "edit": "GUILD",
        "role_add": "GUILD",
        "role_remove": "GUILD"
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
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageGuild;
        Data.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "view",
                description: "View the current CrimsonXP settings for this Server"
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "edit",
                description: "Change the CrimsonXP settings for this Server",
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "broadcast_channel",
                        description: "Where Level Ups/Downs are announced",
                        autocomplete: true
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "text_xp",
                        description: "Should Members earn XP by sending messages?"
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "voice_xp",
                        description: "Should Members earn XP by using Voice Channels?"
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "decaying_xp",
                        description: "Should XP decay for inactive Members?"
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "promote_msg",
                        description: "The message for when Members level up. MUST include {user} and {level}",
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "demote_msg",
                        description: "The message for when Members level down. MUST include {user} and {level}",
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: "role",
                description: "Manage Level Roles for this Server",
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "add",
                        description: "Add a new Level Role to be granted for Members",
                        options: [
                            {
                                type: ApplicationCommandOptionType.Integer,
                                name: "level",
                                description: "The Level this Role is granted at",
                                minValue: 1,
                                maxValue: 100,
                                required: true
                            },
                            {
                                type: ApplicationCommandOptionType.Role,
                                name: "role",
                                description: "The Role to grant to the Member",
                                required: true
                            }
                        ]
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "remove",
                        description: "Remove an existing Level Role",
                        options: [
                            {
                                type: ApplicationCommandOptionType.Role,
                                name: "role",
                                description: "The Level Role to remove",
                                required: true
                            }
                        ]
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
        const subcommandGroupName = slashCommand.options.getSubcommandGroup();

        if ( subcommandName === "view" ) { await viewSettings(slashCommand); }
        else if ( subcommandName === "edit" ) { await editSettings(slashCommand); }

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
* Grabs & Displays the current settings for the Server
* @param {ChatInputCommandInteraction} slashCommand 
*/
async function viewSettings(slashCommand)
{
    // Fetch Data
    if ( await GuildConfig.exists({ guildId: slashCommand.guildId }) == null )
    {
        await slashCommand.reply({ ephemeral: true,
            content: `Sorry, it seems I cannot find any Settings for this Server.
If this error keeps appearing: please remove me from this Server, then re-add me, to fix this error.`
        });

        return;
    }

    const GuildSettings = await GuildConfig.findOne({ guildId: slashCommand.guildId });

    const SettingsEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
    .setTitle(`Settings for ${slashCommand.guild.name}`)
    .setDescription(`*To edit any of these, please use </settings edit:${slashCommand.commandId}>*`)
    .addFields(
        { name: `Broadcast Channel`, value: `${GuildSettings.broadcastChannel === "DISABLE" ? `${CrimsonEmojis.RedX} Disabled` : GuildSettings.broadcastChannel === "CURRENT" ? "User's Current Channel" : `<#${GuildSettings.broadcastChannel}>`}` },
        { name: `Text XP`, value: `${GuildSettings.textXp ? `${CrimsonEmojis.GreenTick} Enabled` : `${CrimsonEmojis.RedX} Disabled`}`, inline: true },
        { name: `Voice XP`, value: `${GuildSettings.voiceXp ? `${CrimsonEmojis.GreenTick} Enabled` : `${CrimsonEmojis.RedX} Disabled`}`, inline: true },
        { name: `Decaying XP`, value: `${GuildSettings.decayingXp ? `${CrimsonEmojis.GreenTick} Enabled`: `${CrimsonEmojis.RedX} Disabled`}`, inline: true },
        { name: `Promotion Message`, value: `${GuildSettings.rankupMessage}` },
        { name: `Demotion Message`, value: `${GuildSettings.rankdownMessage}` }
    );

    await slashCommand.reply({ ephemeral: true, embeds: [SettingsEmbed] });

    return;
}






/**
* Updates the current settings for the Server
* @param {ChatInputCommandInteraction} slashCommand 
*/
async function editSettings(slashCommand)
{
    await slashCommand.deferReply({ ephemeral: true });

    // Fetch Data
    if ( await GuildConfig.exists({ guildId: slashCommand.guildId }) == null )
    {
        await slashCommand.editReply({
            content: `Sorry, it seems I cannot find any Settings for this Server.
If this error keeps appearing: please remove me from this Server, then re-add me, to fix this error.`
        });

        return;
    }

    const GuildSettings = await GuildConfig.findOne({ guildId: slashCommand.guildId });

    // Update based on given values
    const updateBroadcastChannel = slashCommand.options.getString("broadcast_channel");
    const updateTextXp = slashCommand.options.getBoolean("text_xp");
    const updateVoiceXp = slashCommand.options.getBoolean("voice_xp");
    const updateDecayXp = slashCommand.options.getBoolean("decaying_xp");
    const updatePromoteMessage = slashCommand.options.getString("promote_msg");
    const updateDemoteMessage = slashCommand.options.getString("demote_msg");


    // For Embed to ACK back to User
    const editEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
    .setTitle(`Edited Settings for ${slashCommand.guild.name}`)
    .setDescription(`*To view all the settings, please use </settings view:${slashCommand.commandId}>*`);

    if ( updateTextXp != null )
    {
        GuildSettings.textXp = updateTextXp;
        editEmbed.addFields({ name: `Text XP`, value: `${updateTextXp}`, inline: true });
    }
    if ( updateVoiceXp != null )
    {
        GuildSettings.voiceXp = updateVoiceXp;
        editEmbed.addFields({ name: `Voice XP`, value: `${updateVoiceXp}`, inline: true });
    }
    if ( updateDecayXp != null )
    {
        GuildSettings.decayingXp = updateDecayXp;
        editEmbed.addFields({ name: `Decaying XP`, value: `${updateDecayXp}`, inline: true });
    }
    if ( updatePromoteMessage != null )
    {
        if ( !updatePromoteMessage.includes("{user}") || !updatePromoteMessage.includes("{level}") )
        {
            updatePromoteFailed = true;
            editEmbed.addFields({ name: `⚠ Promotion Message Edit Failed`, value: `**Error:** Values "{user}" and/or "{level}" not found in your new Message.` });
        }
        else
        {
            GuildSettings.rankupMessage = updatePromoteMessage;
            editEmbed.addFields({ name: `Promotion Message`, value: `${updatePromoteMessage}` });
        }
    }
    if ( updateDemoteMessage != null )
    {
        if ( !updateDemoteMessage.includes("{user}") || !updateDemoteMessage.includes("{level}") )
        {
            updateDemoteFailed = true;
            editEmbed.addFields({ name: `⚠ Demotion Message Edit Failed`, value: `**Error:** Values "{user}" and/or "{level}" not found in your new Message.` });
        }
        else
        {
            GuildSettings.rankdownMessage = updateDemoteMessage;
            editEmbed.addFields({ name: `Demotion Message`, value: `${updateDemoteMessage}` });
        }
    }


    // Update & Save to Database
    GuildSettings.isNew = false;
    await GuildSettings.save().catch(async err => { await slashCommand.editReply({ content: `${CrimsonEmojis.Warning} **ERROR:** Failed to save changes to your Settings.\nPlease try again, if this error continues, please let us know in [CrimsonXP's Support Server](${CrimsonUris.SupportServerInvite})!` }); });


    // ACK
    await slashCommand.editReply({ embeds: [editEmbed] });
    return;
}
