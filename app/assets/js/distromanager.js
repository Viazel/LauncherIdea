const { DistributionAPI } = require('helios-core/common')

const ConfigManager = require('./configmanager')

// Old WesterosCraft url.
// exports.REMOTE_DISTRO_URL = 'http://mc.westeroscraft.com/WesterosCraftLauncher/distribution.json'
// exports.REMOTE_DISTRO_URL = 'https://helios-files.geekcorner.eu.org/distribution.json'
exports.REMOTE_DISTRO_URL = 'https://niderio.fr/files/distribution.json'

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    ConfigManager.getCommonDirectory(), // Injected forcefully by the preloader.
    ConfigManager.getInstanceDirectory(), // Injected forcefully by the preloader.
    exports.REMOTE_DISTRO_URL,
    false
)

exports.DistroAPI = api