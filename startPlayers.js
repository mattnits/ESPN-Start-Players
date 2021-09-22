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
         
        startPlayersButton.innerHTML = "Start Players";
        startPlayersButton.onclick = () => {console.log("button being pressed");}
        
        startPlayersButton.style.cssText = "position: relative; border: solid grey; border-radius: 20px; border-width: 1px; border-color: grey; cursor: pointer; padding: 6px; font-size: 9pt; margin: 5px;";
        myTeamButtonsDiv.appendChild(startPlayersButton);
    }
});
observer.observe(document.body, { childList: true, subtree: true });



