class Players {
    constructor(name, position, isPlaying, isInjured, currentPos, index) {
        this.name = name;
        this.position = position;
        this.isPlaying = isPlaying;
        this.isInjured = isInjured;
        this.currentPos = currentPos;
        this.index = index;
    }
}

const POS_CORRELATIONS = new Map();
POS_CORRELATIONS.set("C", ["C", "UTIL", "Bench"]);
POS_CORRELATIONS.set("LW", ["LW", "UTIL", "Bench"]);
POS_CORRELATIONS.set("RW", ["RW", "UTIL", "Bench"]);
POS_CORRELATIONS.set("D", ["D", "UTIL", "Bench"]);
POS_CORRELATIONS.set("F", ["F", "UTIL", "Bench"]);
POS_CORRELATIONS.set("G", ["G", "Bench"]);

// Create the button
const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
        const contentNavDiv = Array.from(mutation.addedNodes).filter(n => n.classList && n.classList.contains('content-nav'))[0];
        if (!contentNavDiv) {
            continue;
        }

        const myTeamButtonsDiv = contentNavDiv.getElementsByClassName('myTeamButtons')[0];
        if (!myTeamButtonsDiv) {
            console.warn('Unable to find expected div with class name "myTeamButtons"');
            break;
        }
        
        var startPlayersButton = document.createElement("a");
        startPlayersButton.id = "startPlayers";
        startPlayersButton.innerHTML = "Start Players";
        startPlayersButton.onclick = startPlayers;
        
        startPlayersButton.style.cssText = "position: relative; border: solid grey; border-radius: 20px; border-width: 1px; border-color: rgb(97, 158, 255); cursor: pointer; padding: 6px; font-size: 9pt; margin: 5px; color: rgb(49, 113, 214); font-weight: 600;";
        myTeamButtonsDiv.appendChild(startPlayersButton);
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// Starts active players
function startPlayers() {
    var playerList = initPlayerList();
    var positionMap = initPositionMap();

    getPlayers(positionMap, playerList);
    
    var posLeagueType = checkPositionLeagueType(playerList);

    if (doesBenchPlay(playerList) && !isLineupFull(playerList, posLeagueType)) {
        setLineup(positionMap, playerList);
    }
    
    console.log(playerList);
    
    return;
}

function initPositionMap() {
    var positionMap = new Map();
    positionMap.set("C", 0);
    positionMap.set("LW", 0);
    positionMap.set("RW", 0);
    positionMap.set("D", 0);
    positionMap.set("G", 0);
    positionMap.set("F", 0);
    positionMap.set("IR", 0);
    positionMap.set("UTIL", 0);
    positionMap.set("Bench", 0);

    return positionMap;
}

function initPlayerList() {
    var playerList = new Map();
    playerList.set("C", []);
    playerList.set("LW", []);
    playerList.set("RW", []);
    playerList.set("D", []);
    playerList.set("G", []);
    playerList.set("F", []);
    playerList.set("UTIL", []);
    playerList.set("IR", []);
    playerList.set("Bench", []);

    return playerList;
}

// Gets all the player and goalie data
function getPlayers(positionMap, playerList) {
    
    var table = document.getElementsByClassName("Table__TBODY");
    retrievePlayerTables(positionMap, playerList, table[0]);
    retrievePlayerTables(positionMap, playerList, table[3]);
    
    return;
}

// Retrieves all player data and stores it in a Player object which is then stored in an array
function retrievePlayerTables(positionMap, playerList, table) {
    var positions = "";
    var isPlaying = false;
    var name = "";
    var currentPos = "";
    var isInjured = false;
    var tempPlayer;

    for (i=0; i<table.children.length; i++) {
        // Name
        name =  table.children[i].children[1].children[0].title;
        // CurrentPosition
        currentPos = table.children[i].children[0].children[0].innerHTML;

        if (name !== "Player") {
            
            // Opponent
            if (table.children[i].children[3].children[0].innerHTML === "--") {
                isPlaying = false
            }
            else {
                isPlaying = true;
            }
            // Injured
            if (table.children[i].children[1].children[0].children[0].children[1].children[0].children[0].children.length > 1){
                isInjured = true;
            }
            else {
                isInjured = false;
            }
            // Actual Position(s)
            positions = table.children[i].children[1].children[0].children[0].children[1].children[0].children[1].children[1].innerHTML;
            tempPlayer = new Players(name, positions, isPlaying, isInjured, currentPos, i);
        }
        else {
            tempPlayer = new Players("EMPTY", null, null, null, currentPos, i);
        }

        
        if (currentPos === "RW") {
            updateMaps("RW", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "LW") {
            updateMaps("LW", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "C") {
            updateMaps("C", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "D") {
            updateMaps("D", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "G") {
            updateMaps("G", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "F") {
            updateMaps("F", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "IR") {
            updateMaps("IR", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "Bench") {
            updateMaps("Bench", tempPlayer, positionMap, playerList);
        }
        else if (currentPos === "UTIL") {
            updateMaps("UTIL", tempPlayer, positionMap, playerList);
        }
        tempPlayer = null;
    }
}

// Updates the position hash maps
function updateMaps(position, player, positionMap, playerList) {
    var posCounter = positionMap.get(position);
    positionMap.set(position, posCounter+1);
    if (player != null) {
        
        tempPlayerArr = playerList.get(position);
        tempPlayerArr.push(player);
        playerList.set(position, tempPlayerArr);
    }
    return;
}

// Checks to see if any players on the bench play that day
function doesBenchPlay(playerList) {
    
    var benchPlayers = playerList.get("Bench");

    for (i = 0; i < benchPlayers.length; i++) {
        if (benchPlayers[i].isPlaying) {
            return true;
        }
    }

    return false;
}

// Checks to see if all positions that a player can play in are filled with active players
function isPositionLineupFull(playerList, position) {
    var posCors = POS_CORRELATIONS.get(position);
    for (i = 0; i < posCors.length; i++) {
        if (posCors[i] !== "Bench") {
            var playersArr = playerList.get(posCors[i]);
            for (j = 0; j < playersArr.length; j++) {
                if (!playersArr[j].isPlaying) {
                    return false;
                }
            }
        }
    }
    return true;  
}

// Checks to see if there are just Forwards or if they are split into C/RW/LW
function checkPositionLeagueType(playerList) {

    if (playerList.get("F").length > 0) {
        return "Forwards";
    }
    else {
        return "Wingers";
    }
}

// Checks to see if everyone in the current lineup is already playing
function isLineupFull(playerList, posLeagueType) {
    if (posLeagueType == "Forwards") {
        var forwards = playerList.get("F");
        var defense = playerList.get("D");
        var goalies = playerList.get("G");
        var utility = playerList.get("UTIL");
        var playerArr = [forwards, defense, goalies, utility];

        return _checkPlayersPlaying(playerArr);
    }
    else {
        var centres = playerList.get("C");
        var rightWingers = playerList.get("RW");
        var leftWingers = playerList.get("LW");
        var defense = playerList.get("D");
        var goalies = playerList.get("G");
        var utility = playerList.get("UTIL");
        var playerArr = [centres, rightWingers, leftWingers, defense, goalies, utility];

        return _checkPlayersPlaying(playerArr);
    }
    
}

// Helper method to check if players are playing
function _checkPlayersPlaying(playerArr) {
    for (i = 0; i < playerArr.length; i++) {
        for (j = 0; j < playerArr[i].length; j++) {
            if (!playerArr[i][j].isPlaying) {
                return false;
            }
        }
    }
    return true;
}

// Sets the lineup
async function setLineup(positionMap, playerList) {
        var benchPlayers = playerList.get("Bench");
        var moved = false;
        var playerIndex = 0;
        var i = 0;

        // Loop through all bench players
        while (i < benchPlayers.length) {
            // console.log("I", i);
            // console.log("playerIndex", playerIndex);
            // console.log("BENCH PLAYER", benchPlayers[playerIndex])
            moved = false;
            if (benchPlayers[playerIndex].isPlaying) {
                var posCors = POS_CORRELATIONS.get(benchPlayers[playerIndex].position);
                // Loop through all positions they could play in except bench
                var j = 0;
                while (j < posCors.length && moved == false) {
                    if (posCors[j] !== "Bench" && moved == false) {
                        var playersArr = playerList.get(posCors[j]);
                        // Check to see if there is an empty slot in that position in the current lineup
                        if (isPositionEmpty(positionMap, playerList, posCors[j])) {
                            movePlayers(playerList, benchPlayers[playerIndex], "E");
                            moved = true;
                        }
                        // Check to see if players in those positions are playing and if not, move them
                        else {
                            var k = 0;
                            while (k < playersArr.length && moved == false) {
                                if (!playersArr[k].isPlaying) {
                                    console.log("MOVING IN:", benchPlayers[playerIndex]);
                                    console.log("MOVING OUT:", playersArr[k]);

                                    await(movePlayers(playerList, benchPlayers[playerIndex], playersArr[k]));
                                    
                                    moved = true;
                                }
                                k++;
                            }
                        }
                    }
                    // Break out of the loop if the player has been moved
                    else {
                        break;
                    }
                    j++;
                }
                if (moved === false) {
                    playerIndex++;
                }
            }
            else {
                playerIndex++;
            }
            i++;
        }
    

    return;
}

// Checks to see if a certain position has an empty slot
function isPositionEmpty(positionMap, playerList, position) {
    var playerPosition = playerList.get(position);

    for (i = 0; i < playerPosition.length; i++) {
        if (playerPosition[i].name === "EMPTY") {
            return true;
        }
    }

    return false;
}

// Timer to slow down the moving process
function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

// Moves players from one position to another
async function movePlayers(playerList, playerMovingIn, playerMovingOut) {

    if (playerMovingOut === "E") {
        // Move into empty spot
        var possiblePositions = POS_CORRELATIONS.get(playerMovingIn.position);
        var playerPosition;
        var j = 0, i = 0;
        var moved = false;

        // Ignores bench position
        while (j < possiblePositions.length-1 && moved === false) {
            playerPosition = playerList.get(possiblePositions[j]);

            while (i < playerPosition.length && moved === false) {
                if (playerPosition[i].name === "EMPTY") {
                    var emptyPlayer = playerPosition[i];
                    updatePlayerData(playerList, playerMovingIn, playerPosition[i]);
                    await(clickPlayer(emptyPlayer));
                    await(clickPlayer(playerMovingIn));
                    
                    moved = true;
                }
                i++;
            }
            j++;
        }
    }
    else {
        try {
            updatePlayerData(playerList, playerMovingIn, playerMovingOut);
            await(clickPlayer(playerMovingIn));
            await(clickPlayer(playerMovingOut));
        }
        catch (TypeError) {
            console.warn("Error swapping players", playerMovingIn, playerMovingOut);
            return false;
        }
        
        
    }
    
    return true;
}

// Clicks a player
async function clickPlayer(player) {
    var table = document.getElementsByClassName("Table__TBODY");
    
    if (player.position === "G") {
        table[3].children[player.index].children[2].children[0].children[0].children[0].click();
    }
    else {
        table[0].children[player.index].children[2].children[0].children[0].children[0].click();
    }
    await timer(1000);
    
    return;
}

// Updates the player data after two players are swapped
function updatePlayerData(playerList, playerMovingIn, playerMovingOut) {
    // Update Roster positions
    
    var tempPlayerIndex = playerMovingIn.index;
    playerMovingIn.index = playerMovingOut.index;
    playerMovingOut.index = tempPlayerIndex;

    var tempPlayerIn = removePlayer(playerList, playerMovingIn);
    var tempPlayerOut = removePlayer(playerList, playerMovingOut);

    var tempPlayerCurrentPos = tempPlayerIn.currentPos;
    tempPlayerIn.currentPos = tempPlayerOut.currentPos;
    tempPlayerOut.currentPos = tempPlayerCurrentPos;
    
    insertPlayer(playerList, tempPlayerOut, tempPlayerOut.currentPos);
    insertPlayer(playerList, tempPlayerIn, tempPlayerIn.currentPos);
    

    return;
}

// Removes a player from a certain position
function removePlayer(playerList, player) {
    var posPlayers = playerList.get(player.currentPos);
    
    for (i = 0; i < posPlayers.length; i++) {
        
        if (posPlayers[i].name === player.name) {
            var deletedPlayer = posPlayers.splice(i, 1);
            return deletedPlayer[0];
        }
    }

    console.warn("ERROR - removePlayer: Player not found", player);
    return;
}

// Inserts a player into a certain position
function insertPlayer(playerList, player, position) {
    var posPlayers = playerList.get(position);
    posPlayers.push(player);

    return;
}

