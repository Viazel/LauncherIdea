const button = document.getElementById("connection-button")

discord.addEventListener('click', () => {
    ipc.send("social", "discord")
})

button.addEventListener("click", () => {
    ipc.send(MSFT_OPCODE.OPEN_LOGIN);
})

ipc.on(MSFT_OPCODE.REPLY_LOGIN, (evt, ...data) => {
    if(data[0] !== MSFT_REPLY_TYPE.SUCCESS) return;
    button.innerHTML = "Connexion en cours..."
    button.disabled = true
    AuthManager.addMicrosoftAccount(data[1].code).then(value => {
        button.innerHTML = "Connecté !!"
        document.getElementById("player-name").innerHTML = value.displayName
        document.getElementById("player-skin").src = 'https://mc-heads.net/body/' + value.uuid + '/240'
        switchLauncherView()
    }).catch(result => {
        console.log(result);
    })
})

youtube.onclick = () => {
    ipc.send("social", "youtube")
}