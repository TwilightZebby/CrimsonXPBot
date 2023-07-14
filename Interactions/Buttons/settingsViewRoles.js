const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CrimsonEmojis, CrimsonUris, CustomColors } = require("../../constants.js");
const { GuildRole } = require("../../Mongoose/Models.js");

/** Used by User to switch back to viewing general Settings for Server */
const ViewSettingsButton = new ActionRowBuilder().addComponents([
    new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`settingsViewGeneral`).setLabel("View Settings")
]);

module.exports = {
    // Button's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "settingsViewRoles",

    // Button's Description
    Description: `Shows all the Level Roles that Server has set`,

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

        // Edge case check
        if ( await GuildRole.exists({ guildId: buttonInteraction.guildId }) == null )
        {
            await buttonInteraction.editReply({ components: [], content: `${CrimsonEmojis.Warning} **ERROR:** Couldn't find any Level Roles for this Server. Hiding "View Level Roles" Button as a result.\nIf this error keeps occurring, please contact the developers of CrimsonXP via our [Support Server](${CrimsonUris.SupportServerInvite}).` });
            return;
        }

        // Fetch Level Roles
        const ServerLevelRoles = await GuildRole.find({ guildId: buttonInteraction.guildId });
        
        // Format into readable String
        let roleString = "";
        ServerLevelRoles.forEach(LevelRole => {
            roleString += `L${LevelRole.minimumLevel} — <@&${LevelRole.roleId}>\n`;
        });

        // Format into Embed
        const LevelRolesEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
        .setTitle(`Level Roles for ${buttonInteraction.guild.name}`)
        .setDescription(roleString);

        // ACK to User
        await buttonInteraction.editReply({ embeds: [LevelRolesEmbed], components: [ViewSettingsButton] });
        return;
    }
}
