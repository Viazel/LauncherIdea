const ipc = require('electron').ipcRenderer
const update = document.getElementById('update');

ipc.send('splash')

ipc.on('autoUpdateNotification', (evt, data) => {
    update.innerHTML = data;
})