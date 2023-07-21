const { app, BrowserWindow } = require('electron');
// const path = require('path');

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
  });

  mainWindow.loadURL('http://localhost:3000')
    .then(() => {
      mainWindow.webContents.openDevTools();
    });
  //
  // mainWindow.loadFile(path.join(__dirname, 'app/dist/index.html')).then(() => {
  //     mainWindow.webContents.openDevTools(
  //         { mode: 'detach' }
  //     );
  // });
});