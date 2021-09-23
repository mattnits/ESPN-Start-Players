class Players {
    constructor(name, position, isPlaying, isInjured, currentPos) {
        this.name = name;
        this.position = position;
        this.isPlaying = isPlaying;
        this.isInjured = isInjured;
        this.currentPos = currentPos;
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

// Start active players
function startPlayers() {
    var playerList = initPlayerList();
    var positionMap = initPositionMap();

    getPlayers(positionMap, playerList);
    console.log(playerList)
    var test = isPositionLineupFull(playerList, "C");
    
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
            tempPlayer = new Players(name, positions, isPlaying, isInjured, currentPos);
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

function clickButton() {
    var table = document.getElementsByClassName("Table__TBODY");
    console.log(table[0].children[0].children[2].children[0].children[0].children[0]);
    table[0].children[0].children[2].children[0].children[0].children[0].click();
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

