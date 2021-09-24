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
    // console.log(playerList, positionMap);
    var posLeagueType = checkPositionLeagueType(playerList);

    if (doesBenchPlay(playerList) && !isLineupFull(playerList, posLeagueType)) {
        setLineup(positionMap, playerList);
    }


    var playersTest = playerList.get("C");

    // setTimeout(function() {clickPlayer(playersTest[0])}, 3000);
    // setTimeout(clickPlayer(playerMovingOut), 5000);

    // console.log(playerList);
      
    
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

// Retrieves all player data and stores it in a Player object which is then stored in an array
function getPlayers(positionMap, playerList) {
    var positions = "";
    var isPlaying = false;
    var name = "";
    var currentPos = "";
    var isInjured = false;
    var tempPlayer;
    
    var table = document.getElementsByClassName("Table__TBODY");
    
    for (i=0; i<table[0].children.length; i++) {
        // Name
        name =  table[0].children[i].children[1].children[0].title;
        // CurrentPosition
        currentPos = table[0].children[i].children[0].children[0].innerHTML;

        if (name !== "Player") {
            // CurrentPosition
            currentPos = table[0].children[i].children[0].children[0].innerHTML;
            // Opponent
            if (table[0].children[i].children[3].children[0].innerHTML === "--") {
                isPlaying = false
            }
            else {
                isPlaying = true;
            }
            // Injured
            if (table[0].children[i].children[1].children[0].children[0].children[1].children[0].children[0].children.length > 1){
                isInjured = true;
            }
            else {
                isInjured = false;
            }
            // Actual Position(s)
            positions = table[0].children[i].children[1].children[0].children[0].children[1].children[0].children[1].children[1].innerHTML;
            tempPlayer = new Players(name, positions, isPlaying, isInjured, currentPos, i);
        }

        // Create a function to do all the work inside these statements to make it more readable
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
    return;
}

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

async function setLineup(positionMap, playerList) {
    
    
        var benchPlayers = playerList.get("Bench");
        var moved = false;
        
        // Loop through all bench players
        for (i = 0; i < benchPlayers.length; i++) {
            // console.log("I", i);
            moved = false;
            if (benchPlayers[i].isPlaying) {
                var posCors = POS_CORRELATIONS.get(benchPlayers[i].position);
                // Loop through all positions they could play in except bench
                // for (j = 0; j < posCors.length; j++) {
                var j = 0;
                while (j < posCors.length && moved == false) {
                    // console.log("J", j);
                    if (posCors[j] !== "Bench" && moved == false) {
                        var playersArr = playerList.get(posCors[j]);
                        // Check to see if there is an empty slot in that position in the current lineup
                        if (isPositionEmpty(positionMap, playerList, posCors[j])) {
                            movePlayers(playerList, benchPlayers[i], "E");
                            moved = true;
                        }
                        // Check to see if players in those positions are playing and if not, move them
                        else {
                            var k = 0;
                            // for (k = 0; k < playersArr.length; k++) {
                            while (k < playersArr.length && moved == false) {
                                // console.log("K", k);
                                if (!playersArr[k].isPlaying) {
                                    console.log("MOVING IN:", benchPlayers[i]);
                                    console.log("MOVING OUT:", playersArr[k]);

                                    await(movePlayers(playerList, benchPlayers[i], playersArr[k]));
                                    
                                    moved = true;
                                    // console.log("First Statement: ", j < posCors.length && moved == false);
                                    // console.log("Second Statement: ", k < playersArr.length && moved == false);
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
            }
        }
    

    return;
}

function isPositionEmpty(positionMap, playerList, position) {
    var mapPosition = positionMap.get(position);
    var playerPosition = playerList.get(position);

    if (mapPosition > playerPosition.length) {
        return true;
    }

    return false;
}

function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

// Update the index numbers on players when they changing positions
async function movePlayers(playerList, playerMovingIn, playerMovingOut) {
    var table = document.getElementsByClassName("Table__TBODY");
    

    if (playerMovingOut === "E") {
        // Move into empty spot
    }
    else {
        // Swap players
        // console.log(playerMovingIn, playerMovingOut);
        
        
        console.log(table[0].children[playerMovingIn.index].children[2].children[0]);
        console.log(table[0].children[playerMovingOut.index].children[2].children[0]);
        console.log("---------------------------------------");
        // try {
            
                updatePlayerData(playerList, playerMovingIn, playerMovingOut);


                
                await(clickPlayer(playerMovingIn));
                await(clickPlayer(playerMovingOut));
                
                
            
            
        // }
        // catch (TypeError) {
        //     console.warn("Error swapping players", playerMovingIn, playerMovingOut);
        //     return false;
        // }
        
        
    }
    
    return true;
}

async function clickPlayer(player) {
    var table = document.getElementsByClassName("Table__TBODY");
    console.log("CLICK FUNCTION", table[0].children[player.index].children[2].children[0].children[0]);
    table[0].children[player.index].children[2].children[0].children[0].children[0].click();
    await timer(500);
    return;
}

function updatePlayerData(playerList, playerMovingIn, playerMovingOut) {
    
    
    var tempPlayerIndex = playerMovingIn.index;
    playerMovingIn.index = playerMovingOut.index;
    playerMovingOut.index = tempPlayerIndex;

    
    
    var tempPlayerIn = removePlayer(playerList, playerMovingIn);
    var tempPlayerOut = removePlayer(playerList, playerMovingOut);
    
    
    insertPlayer(playerList, tempPlayerOut, tempPlayerIn.currentPos);
    insertPlayer(playerList, tempPlayerIn, tempPlayerOut.currentPos);

    return;
}

// Check all available positions
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

function insertPlayer(playerList, player, position) {
    var posPlayers = playerList.get(position);
    posPlayers.push(player);

    
    return;
}

