const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Shahin Traders",
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Remove the default menu bar for a cleaner look
    autoHideMenuBar: true,
  });

  // In development, load from localhost. In production, we'd load the exported files.
  const startURL = isDev 
    ? "http://localhost:3000" 
    : `file://${path.join(__dirname, "../build/index.html")}`;

  win.loadURL(startURL);

  if (isDev) {
    // Optional: Open DevTools automatically in development
    // win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
