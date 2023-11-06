document.querySelectorAll('#launcher-option > .box-social').forEach(element => {
    element.onclick = async () => {
        // switchPlayView(element)
        launchGame(element.attributes.getNamedItem('server').value)
    }
})

async function launchGame(serverName) {

    document.getElementById("progess").value = 0;

    const sysRoot = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)

    let dataPath = path.join(sysRoot, 'Hyranio Launcher');

    const http = require("https")
    const zip = require("decompress")

    let fileName;

    if(process.platform === "darwin") {
        fileName = "javaMac.zip"
    }else {
        fileName = "javaWindows.zip"
    }

    if(!fs.existsSync(path.join(dataPath, "Java"))) {
        document.getElementById("progress-label").style.display = "block"
        document.getElementById("progess").style.display = "block"
        document.getElementById("progress-label").innerText = "Téléchargement de Java..."
        fs.mkdirSync(path.join(dataPath, "Java"))
        const file = fs.createWriteStream(path.join(dataPath,"Java", fileName));
        let i =0;
        const request = http.get("https://niderio.fr/files/" + fileName, function(response) {
            response.pipe(file);
            // after download completed close filestream
            file.on("drain", () => {
                document.getElementById("progess").value = Math.round(i/11654 * 100);
                i++;
            })

            file.on("finish", () => {
                file.close();
                zip(path.join(dataPath, "Java", fileName), path.join(dataPath, "Java")).then(() => {
                    fs.unlinkSync(path.join(dataPath, "Java", fileName))
                    document.getElementById("progess").value = 0;
                    next(serverName, dataPath)
                })
            });
        });
        return;
    }
    next(serverName, dataPath);
}

async function next(serverName, dataPath) {
    const { DistroAPI } = require('../assets/js/distromanager')
    const remote = require('@electron/remote')
    const { FullRepair, MojangIndexProcessor, DistributionIndexProcessor } = require('helios-core/dl')
    const ProcessBuilder = require('../assets/js/processbuilder')

    const distro = await DistroAPI.refreshDistributionOrFallback()

    ConfigManager.setSelectedServer(serverName)
    ConfigManager.setModConfiguration(serverName, {
        id: serverName,
        mods: {}
    })
    ConfigManager.setMinRAM(serverName, '4G')
    ConfigManager.setMaxRAM(serverName, '10G')
    let javaversion = "";
    switch (serverName) {
        case "Hyranio-1.8.9":
            javaversion = "1.8"
            break;
        case "Crew-1.20.1":
            javaversion = "17"
            break;
    }

    let java;
    if(process.platform === "darwin") {
        java = path.join(dataPath, "Java", "bin", "java")
    }else {
        java = path.join(dataPath, "Java", "bin", "javaw.exe")
    }

    ConfigManager.setJavaExecutable(serverName, java)
    ConfigManager.setJVMOptions(serverName, ['-Xmn128M'])
    ConfigManager.save()

    const serv = distro.getServerById(serverName)

    const fullRepairModule = new FullRepair(
        ConfigManager.getCommonDirectory(),
        ConfigManager.getInstanceDirectory(),
        ConfigManager.getLauncherDirectory(),
        ConfigManager.getSelectedServer(),
        DistroAPI.isDevMode()
    )

    fullRepairModule.spawnReceiver()

    let invalidFileCount = 0

    try {
        invalidFileCount = await fullRepairModule.verifyFiles(percent => {
            console.log(percent)
        })
    } catch (err) {
        console.log(err)
    }

    if(invalidFileCount > 0) {
        document.getElementById("progress-label").style.display = "block"
        document.getElementById("progess").style.display = "block"
        document.getElementById("progress-label").innerText = "Téléchargement du Jeu..."
        try {
            await fullRepairModule.download(percent => {
                document.getElementById("progess").value = percent;
            })
        } catch (err) {
            console.log(err)
        }
    }

    document.getElementById("progress-label").style.display = "none"
    document.getElementById("progess").style.display = "none"
    document.getElementById("progess").value = 0;

    fullRepairModule.destroyReceiver()

    const mojang = new MojangIndexProcessor(
        ConfigManager.getCommonDirectory(),
        serv.rawServer.minecraftVersion
    )
    const distributionIndexProcessor = new DistributionIndexProcessor(
        ConfigManager.getCommonDirectory(),
        distro,
        serv.rawServer.id
    )

    const versionData = await mojang.getVersionJson()
    const versionForge = await distributionIndexProcessor.loadForgeVersionJson()

    let pb = new ProcessBuilder(serv, versionData, versionForge, ConfigManager.getSelectedAccount(), remote.app.getVersion(), serverName)

    try {
        const proc = pb.build()

        proc.on('spawn', () => {
            ipc.send('winOpacity', 'hide')
            document.getElementById("progress-label").style.display = "none"
            document.getElementById("progess").style.display = "none"
        })

        proc.on('close', () => {
            ipc.send('winOpacity', 'show')
        })

        proc.stderr.on('data', event => {
            console.log(event)
        })

    } catch (err) {
        console.log(err)
    }
}