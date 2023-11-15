ConfigManager.load()

if(ConfigManager.isLoaded()) {
    if(ConfigManager.getSelectedAccount() !== undefined) {
        button.disabled = true
        button.innerHTML = "Connexion en cours..."
        AuthManager.validateSelected().then(valuee => {
            if(valuee) {
                if(ConfigManager.getSelectedAccount() !== undefined) {
                    setTimeout(async () => {
                        button.innerHTML = "Connecté !!"
                        const value = await ConfigManager.getSelectedAccount()
                        document.getElementById("player-name").innerHTML = value.displayName
                        document.getElementById("player-skin").src = 'https://mc-heads.net/body/' + value.uuid + '/240'
                        switchLauncherView()
                    }, 1000)
                }
            }else {
                button.disabled = false
                button.innerHTML = "Se connecter !"
                ConfigManager.removeAuthAccount(ConfigManager.getSelectedAccount().uuid)
                ConfigManager.save()
            }
        })
    }
}

ipc.send("app")
ipc.on("test", () => {
    console.log("uhndfsgisdhgf")
})