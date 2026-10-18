const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

app.setName('Musair');
app.setAppUserModelId('com.musair.pricingstudio');

function openExternalUrl(value) {
  try {
    const url = new URL(value);
    if (['https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      void shell.openExternal(url.toString());
    }
  } catch {
    // Ignore malformed or unsupported external URLs.
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 900,
    minHeight: 650,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      openExternalUrl(url);
    }
  });

  void window.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
