// Grab Json Store of Levels
const LevelStore = require('../../JsonFiles/levels.json');
const LevelObject = Object.values(LevelStore);


module.exports = {

    /**
     * Calculates the Level based off the XP
     * @param {Number} xp 
     * 
     * @returns {Number} Level
     */
    calculateLevel(xp)
    {

        // Calculate
        for ( let i = 0; i <= LevelObject.length; i++ )
        {
            let tempLevel = LevelStore[`l${i}`];

            
            if ( xp <= 0 ) { return 0; } // Minimum Level. Will, ofc can't go below 0 in this case!
            else if ( xp > LevelStore['l200'] ) { return 200; } // Maximum Level
            else if ( xp > tempLevel ) { continue; } // Has more XP than currently looked at Level
            else if ( xp < tempLevel ) { return i - 1; } // Doesn't have enough XP to match next Level
            else if ( xp === tempLevel ) { return i; } // Matches current level exactly
        }
    },









    /**
     * Compare two different Levels to see if there's any change
     * @param {Number} oldLevel 
     * @param {Number} newLevel 
     * 
     * @returns {"LEVEL_UP"|"LEVEL_DOWN"|"NO_CHANGE"}
     */
    compareLevels(oldLevel, newLevel)
    {
        if ( newLevel > oldLevel ) { return "LEVEL_UP"; }
        else if ( newLevel === oldLevel ) { return "NO_CHANGE"; }
        else if ( newLevel < oldLevel ) { return "LEVEL_DOWN"; }
    }

};
