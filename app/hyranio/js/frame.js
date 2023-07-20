const ipc = require("electron").ipcRenderer;
const ConfigManager = require("../assets/js/configmanager");
const minus = document.getElementById("minus");
const cross = document.getElementById("cross");
const fs = require('fs-extra')
const path = require("path")
const os = require("os")
const discord = document.getElementById("discord-social")
const youtube = document.getElementById("youtube-social")
const { MSFT_OPCODE, MSFT_REPLY_TYPE } = require("../assets/js/ipcconstants")
const AuthManager = require("../assets/js/authmanager");

fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()), (err) => {
    if(err){
        console.log("Error ", err)
    } else {
        console.log("Clean")
    }
})

function switchLauncherView() {
    document.getElementById("connection-part").classList.toggle("activatedLauncher")
    document.body.classList.toggle("activatedLauncher")
    document.getElementById("launcher").classList.toggle("activatedLauncher")
}

function switchPlayView(element) {
    element.classList.toggle("activatedPlay")
    document.getElementById("launcher-option").classList.toggle("activatedPlay")
}

minus.onclick = () => {
    ipc.send("minus")
}

cross.onclick = () => {
    ipc.send("quit")
}