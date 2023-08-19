const { Collection, Message } = require("discord.js");
const { GlobalBlocklist, GuildBlocklist, GuildXp } = require("../../Mongoose/Models");
const { generateXp } = require("./Experience");
const { calculateLevel, compareLevels } = require("./Levels");
const { levelDownText, levelUpText } = require("./Broadcasts");
const { promoteTextRole } = require("./LevelRoles");

const XpCooldown = new Collection();


module.exports = {

    /**
     * Starting point of granting XP on Message_Create Event - check for blocklist first
     * 
     * @param {Message} message
     */
    async checkBlocklist(message)
    {
        // ***************************************************
        
        // Check Global Blocklist first
        // Guild
        if ( await GlobalBlocklist.exists({ blockedId: message.guildId }) != null ) { return null; }
        // User
        if ( await GlobalBlocklist.exists({ blockedId: message.author.id }) != null ) { return null; }


        // Check Guild Specific Blocklist next
        // Member
        if ( await GuildBlocklist.exists({ guildId: message.guildId, blockedId: message.author.id }) != null ) { return null; }

        // Channel
        if ( await GuildBlocklist.exists({ guildId: message.guildId, blockedId: message.channelId }) != null ) { return null; }
        
        // Any of the Member's Role
        let memberRoles = message.member.roles.cache;
        let guildBlockDocuments = await GuildBlocklist.find({ guildId: message.guildId });

        memberRoles.forEach(async role => {
            // Filter out atEveryone
            if ( role.id !== message.guildId )
            {
                if ( guildBlockDocuments.includes({ blockedId: role.id }) ) { return null; }
            }
        });



        // ***************************************************

        // Not in any Blocklists, move onto XP Cooldowns
        await checkCooldown(message);
        return;
    }

};




/**
 * Checks if the User is in the XP Cooldown or not
 * @param {Message} message 
 */
async function checkCooldown(message)
{
    // Is User in XP Cooldown?
    if ( !XpCooldown.has(message.author.id) )
    {
        // Is NOT in Cooldown, create one
        XpCooldown.set(message.author.id, new Collection());
    }


    // Setup needed constants
    const Now = Date.now();
    const Timestamps = XpCooldown.get(message.author.id);
    const CooldownLength = 59500; // 59.5 Seconds in milliseconds

    // Check Cooldown Length
    if ( Timestamps.has(message.author.id) )
    {
        const ExpirationTime = Timestamps.get(message.author.id) + CooldownLength;
        if ( Now < ExpirationTime ) { return null; }
    }
    else
    {
        Timestamps.set(message.author.id, Now);
        setTimeout(() => Timestamps.delete(message.author.id), CooldownLength);
    }


    // Not in active Cooldown at time of sending Message, move onto granting XP!
    await grantXp(message);
    return;
}




/**
 * Grants the User a random amount of XP
 * @param {Message} message 
 */
async function grantXp(message)
{
    // Create new Document if this is User's first time in Server
    let fetchedDocument;

    if ( await GuildXp.exists({ guildId: message.guildId, userId: message.author.id }) == null )
    {
        fetchedDocument = await GuildXp.create({ guildId: message.guildId, userId: message.author.id });
    }
    else
    {
        fetchedDocument = await GuildXp.findOne({ guildId: message.guildId, userId: message.author.id });
        fetchedDocument.isNew = false;
    }


    // Add new XP
    let currentXp = fetchedDocument.textXp;
    let newXp = currentXp + generateXp();
    fetchedDocument.textXp = newXp;
    await fetchedDocument.save();


    // Calculate Level difference, if any
    let currentLevel = calculateLevel(currentXp);
    let newLevel = calculateLevel(newXp);
    let levelDifference = compareLevels(currentLevel, newLevel);

    switch (levelDifference)
    {
        case "NO_CHANGE":
            break;

        case "LEVEL_UP":
            await levelUpText(message, newLevel);
            await promoteTextRole(message, newLevel);
            break;

        case "LEVEL_DOWN":
            await levelDownText(message, newLevel);
            break;

        default:
            break;
    }

    return;
}
