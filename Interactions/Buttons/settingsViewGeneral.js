const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CrimsonEmojis, CustomColors, DiscordClient } = require("../../constants.js");
const { GuildConfig } = require("../../Mongoose/Models.js");

/** Used by User to view all Level Roles for Server */
const ViewRolesButton = new ActionRowBuilder().addComponents([
    new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`settingsViewRoles`).setLabel("View Level Roles")
]);

module.exports = {
    // Button's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "settingsViewGeneral",

    // Button's Description
    Description: `Shows general settings for the Server`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 15,



    /**
     * Executes the Button
     * @param {ButtonInteraction} buttonInteraction 
     */
    async execute(buttonInteraction)
    {
        await buttonInteraction.deferUpdate();

        // Fetch Data
        if ( await GuildConfig.exists({ guildId: buttonInteraction.guildId }) == null )
        {
            await buttonInteraction.followUp({ ephemeral: true,
                content: `Sorry, it seems I cannot find any Settings for this Server.
If this error keeps appearing: please remove me from this Server, then re-add me, to fix this error.`
            });

            return;
        }

        const GuildSettings = await GuildConfig.findOne({ guildId: buttonInteraction.guildId });

        // Quickly fetch command ID for `/settings edit` Command
        let crimsonCommands = await DiscordClient.application.commands.fetch();
        let settingsViewCommand = crimsonCommands.find(command => command.name === "settings");

        const SettingsEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
        .setTitle(`Settings for ${buttonInteraction.guild.name}`)
        .setDescription(`- *To edit any of these, please use </settings edit:${settingsViewCommand.id}>*
- *To add a Level Role, use </settings role add:${settingsViewCommand.id}>*
- *To remove a Level Role, use </settings role remove:${settingsViewCommand.id}>*`)
        .addFields(
            { name: `Broadcast Channel`, value: `${GuildSettings.broadcastChannel === "DISABLE" ? `${CrimsonEmojis.RedX} Disabled` : GuildSettings.broadcastChannel === "CURRENT" ? "User's Current Channel" : `<#${GuildSettings.broadcastChannel}>`}` },
            { name: `Text XP`, value: `${GuildSettings.textXp ? `${CrimsonEmojis.GreenTick} Enabled` : `${CrimsonEmojis.RedX} Disabled`}`, inline: true },
            { name: `Voice XP`, value: `${GuildSettings.voiceXp ? `${CrimsonEmojis.GreenTick} Enabled` : `${CrimsonEmojis.RedX} Disabled`}`, inline: true },
            { name: `Decaying XP`, value: `${GuildSettings.decayingXp ? `${CrimsonEmojis.GreenTick} Enabled`: `${CrimsonEmojis.RedX} Disabled`}`, inline: true },
            { name: `Promotion Message`, value: `${GuildSettings.rankupMessage}` },
            { name: `Demotion Message`, value: `${GuildSettings.rankdownMessage}` }
        );

        // ACK
        await buttonInteraction.editReply({ embeds: [SettingsEmbed], components: [ViewRolesButton] });
        return;
    }
}
