const { ChatInputCommandInteraction, ChatInputApplicationCommandData, AutocompleteInteraction, ApplicationCommandType, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");

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
                description: "View the current settings for this Server"
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "edit",
                description: "Change the settings for this Server",
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
        //.
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
