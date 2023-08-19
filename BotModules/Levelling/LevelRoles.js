const { Message, PermissionFlagsBits } = require("discord.js");
const { GuildTextRole } = require("../../Mongoose/Models");

module.exports = {

    /**
     * If one is set, promotes the User's Level Role
     * 
     * @param {Message} message 
     * @param {Number} level 
     */
    async promoteTextRole(message, level)
    {
        // First check for Manage Roles Permission on Bot itself
        if ( !message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles) ) { return; }

        // Now check that there *are* Level Roles set for this Server
        if ( await GuildTextRole.exists({ guildId: message.guildId }) == null ) { return; }

        // Check if the new Level has a Role set
        if ( await GuildTextRole.exists({ guildId: message.guildId, minimumLevel: level }) == null ) { return; }

        // Now we know there is a Role to promote to
        let newLevelRole = await GuildTextRole.findOne({ guildId: message.guildId, minimumLevel: level });

        // Check for lower Level Role, so that we can swap the two for the User
        let searchLevelRoles = await GuildTextRole.find({ guildId: message.guildId }).lt("minimumLevel", level).limit(1);

        if ( searchLevelRoles.length == 1 )
        {
            // A lower Role was found. Remove it!
            /** @type {GuildTextRole} */
            let lowerRole = searchLevelRoles.pop();
            await message.member.roles.remove(lowerRole.roleId, "User levelled up! (Revoking prior Role)")
            .then(async fulfilled => {
                await message.member.roles.add(newLevelRole.roleId, "User levelled up! (Granting new level Role)");
            });
        }
        else
        {
            // No lower role was found. Only add the new Role
            await message.member.roles.add(newLevelRole.roleId, "User levelled up!");
        }

        return;
    },





    /**
     * If one is set, demotes the User's Level Role
     * 
     * @param {Message} message 
     * @param {Number} level 
     */
    async demoteTextRole(message, level)
    {
        // TODO: This

        return;
    }

};
