module.exports = {

    /**
     * Generates a random amount of XP
     * 
     * @returns {Number} xp
     */
    generateXp()
    {
        return Math.floor( ( Math.random() * 25 ) + 15 );
    }

};
