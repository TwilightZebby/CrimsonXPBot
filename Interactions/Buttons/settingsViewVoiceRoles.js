const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CrimsonEmojis, CrimsonUris, CustomColors } = require("../../constants.js");
const { GuildVoiceRole, GuildTextRole } = require("../../Mongoose/Models.js");

const ViewSettingsButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`settingsViewGeneral`).setLabel("View Settings");
const ViewTextRoleButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`settingsViewTextRoles`).setLabel("View Text Level Roles");

module.exports = {
    // Button's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "settingsViewVoiceRoles",

    // Button's Description
    Description: `Shows all the Voice Level Roles that Server has set`,

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
        if ( await GuildVoiceRole.exists({ guildId: buttonInteraction.guildId }) == null )
        {
            await buttonInteraction.editReply({ components: [], content: `${CrimsonEmojis.Warning} **ERROR:** Couldn't find any Voice Level Roles for this Server. Hiding "View Level Roles" Button(s) as a result.\nIf this error keeps occurring, please contact the developers of CrimsonXP via our [Support Server](${CrimsonUris.SupportServerInvite}).` });
            return;
        }

        // Fetch Level Roles
        const ServerLevelRoles = await GuildVoiceRole.find({ guildId: buttonInteraction.guildId });
        
        // Format into readable String
        let roleString = "";
        ServerLevelRoles.forEach(LevelRole => {
            roleString += `L${LevelRole.minimumLevel} — <@&${LevelRole.roleId}>\n`;
        });

        // Format into Embed
        const LevelRolesEmbed = new EmbedBuilder().setColor(CustomColors.CrimsonMain)
        .setTitle(`Voice Level Roles for ${buttonInteraction.guild.name}`)
        .setDescription(roleString);

        // Check if any Text Roles are set
        if ( await GuildTextRole.exists({ guildId: buttonInteraction.guildId }) != null ) { viewSettingsRow.addComponents(ViewTextRoleButton); }

        // ACK to User
        await buttonInteraction.editReply({ embeds: [LevelRolesEmbed], components: [viewSettingsRow] });
        return;
    }
}
