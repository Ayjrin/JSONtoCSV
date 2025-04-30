const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icons/linux/icon.png')
  });

  // Determine how to load the app based on environment
  const startUrl = url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  // Load the index.html file
  mainWindow.loadURL(startUrl);
  
  // Hide the menu bar
  mainWindow.setMenuBarVisibility(false);
  
  // For debugging
  console.log('Loading HTML from:', startUrl);
  
  // Optionally open DevTools for debugging
  // mainWindow.webContents.openDevTools();
  
  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle file saving for CSV download
ipcMain.handle('save-file', async (event, data) => {
  const { fileName, csvContent } = data;
  
  const defaultPath = path.join(app.getPath('downloads'), fileName);
  
  const result = await dialog.showSaveDialog({
    title: 'Save CSV File',
    defaultPath: defaultPath,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });
  
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, csvContent);
    return { success: true, filePath: result.filePath };
  } else {
    return { success: false };
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS applications keep their menu bar active until quit explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS re-create a window when the dock icon is clicked and no windows are open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
