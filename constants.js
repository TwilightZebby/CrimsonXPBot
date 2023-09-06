const { Client, GatewayIntentBits, Collection } = require("discord.js");

module.exports =
{
    /** Discord Client representing the Bot/App */
    DiscordClient: new Client({ 
        intents: [ 
            GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildMembers
        ]
    }),

    /** Collections that are used in many locations */
    Collections: {
        TextCommands: new Collection(),
        SlashCommands: new Collection(),
        ContextCommands: new Collection(),
        Buttons: new Collection(),
        Selects: new Collection(),
        Modals: new Collection(),

        TextCooldowns: new Collection(),
        SlashCooldowns: new Collection(),
        ContextCooldowns: new Collection(),
        ButtonCooldowns: new Collection(),
        SelectCooldowns: new Collection()
    },

    /** Colours used, named as such to avoid conflicts with DJS's Colors */
    CustomColors: {
        /** Main CrimsonXP Colour */
        CrimsonMain: "#DC143C"
    },

    /** URLs/URIs used */
    CrimsonUris: {
        /** Main Avatar/PFP for CrimsonXP */
        CrimsonAvatar: "https://i.imgur.com/JlAQDef.png",
        /** Main Invite Link to Support Server */
        SupportServerInvite: "https://discord.gg/discord-developers", // Placeholder for now, will replace later.
        /** CrimsonXP Bot Invite Link */
        BotInvite: "https://discord.com/api/oauth2/authorize?client_id=1122149577630433331&permissions=274878221312&scope=applications.commands%20bot"
    },

    /** Emojis used */
    CrimsonEmojis: {
        GreenTick: ":white_check_mark:",
        RedX: ":x:",
        Warning: ":warning:"
    },

    /** Static Strings */
    StaticStrings: {
        CommandNotImplemented: `Sorry, but this Command hasn't been implemented at this stage!\nDon't worry, it'll be added before full release!`
    }
}
