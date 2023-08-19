const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CrimsonEmojis, CrimsonUris, CustomColors } = require("../../constants.js");
const { GuildTextRole, GuildVoiceRole } = require("../../Mongoose/Models.js");

const ViewSettingsButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`settingsViewGeneral`).setLabel("View Settings");
const ViewVoiceRoleButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`settingsViewVoiceRoles`).setLabel("View Voice Level Roles");

module.exports = {
    // Button's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "settingsViewTextRoles",

    // Button's Description
    Description: `Shows all the Text Level Roles that Server has set`,

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

        let viewSettingsRow = new ActionRowBuilder().addComponents(ViewSettingsButton);

        // Edge case check
        if ( await GuildTextRole.exists({ guildId: buttonInteraction.guildId }) == null )
        {
            await buttonInteraction.editReply({ components: [], content: `${CrimsonEmojis.Warning} **ERROR:** Couldn't find any Text Level Roles for this Server. Hiding "View Level Roles" Button(s) as a result.\nIf this error keeps occurring, please contact the developers of CrimsonXP via our [Support Server](${CrimsonUris.SupportServerInvite}).` });
            return;
        }

        // Fetch Level Roles
        const ServerLevelRoles = await GuildTextRole.find({ guildId: buttonInteraction.guildId });
        
        // Format into readable String
        let roleString = "";
        ServerLevelRoles.forEach(LevelRole => {
            roleString += `L${LevelRole.minimumLevel} — <@&${LevelRole.roleId}>\n`;
        });

        // Format into Embed
        const LevelRolesEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
        .setTitle(`Text Level Roles for ${buttonInteraction.guild.name}`)
        .setDescription(roleString);

        // Check if any Voice Roles are set
        if ( await GuildVoiceRole.exists({ guildId: buttonInteraction.guildId }) != null ) { viewSettingsRow.addComponents(ViewVoiceRoleButton); }

        // ACK to User
        await buttonInteraction.editReply({ embeds: [LevelRolesEmbed], components: [viewSettingsRow] });
        return;
    }
}
