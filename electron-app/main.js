const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const sharp = require("sharp"); // Use sharp for resizing

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.display = 'flex';
      document.body.style.justifyContent = 'center';
      document.body.style.alignItems = 'center';
    `);
  });

  // Load the built Vite app
  win.loadFile(path.join(__dirname, 'CleanLayer', 'dist', 'index.html'));

  // Listen for background removal requests from frontend
  ipcMain.handle('remove-background', async (event, inputPath, outputPath, resolution) => {
    const absoluteInputPath = path.resolve(inputPath);
    const absoluteOutputPath = path.resolve(outputPath);

    console.log('Absolute Input Path:', absoluteInputPath);
    console.log('Absolute Output Path:', absoluteOutputPath);
    console.log('Resolution:', resolution);

    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, 'ai', 'background_removal.py');
      console.log('Python Script Path:', pythonScript);

      const pythonProcess = spawn(
        'python',
        [`"${pythonScript}"`, `"${absoluteInputPath}"`, `"${absoluteOutputPath}"`, resolution],
        {
          cwd: path.join(__dirname, 'ai'),
          shell: true,
        }
      );

      pythonProcess.stdout.on('data', (data) => {
        console.log('Python stdout:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('Python stderr:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(absoluteOutputPath);
        } else {
          reject(new Error('Background removal failed'));
        }
      });
    });
  });

  ipcMain.handle('select-output-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) return '';
    return result.filePaths[0];
  });

  ipcMain.handle('save-uploaded-file', async (event, buffer, fileName) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir); // Create the uploads directory if it doesn't exist
    }
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer)); // Save the file to the uploads directory
    return filePath; // Return the saved file path
  });

  ipcMain.handle('get-temp-dir', async () => {
    return os.tmpdir();
  });

  ipcMain.handle('select-input-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'] }
      ]
    });
    if (result.canceled || result.filePaths.length === 0) return '';
    return result.filePaths[0];
  });

  ipcMain.handle('select-output-file', async (event, defaultPath) => {
    const result = await dialog.showSaveDialog({
      defaultPath,
      filters: [
        { name: 'PNG Image', extensions: ['png'] }
      ]
    });
    if (result.canceled || !result.filePath) return '';
    return result.filePath;
  });

  ipcMain.handle('export-image', async (event, srcPath, destPath, resolution) => {
    try {
      console.log("Exporting image...");
      console.log("Source Path:", srcPath);
      console.log("Destination Path:", destPath);
      console.log("Resolution:", resolution);

      // Resize the image based on the selected resolution
      let width, height;
      if (resolution === "hd") {
        width = 1280;
        height = 720;
      } else if (resolution === "fullhd") {
        width = 1920;
        height = 1080;
      } else if (resolution === "4k") {
        width = 3840;
        height = 2160;
      } else {
        // If "original", just copy the file without resizing
        fs.copyFileSync(srcPath, destPath);
        return destPath;
      }

      // Use sharp to resize the image
      await sharp(srcPath)
        .resize(width, height, { fit: "inside" }) // Resize while maintaining aspect ratio
        .toFile(destPath);

      console.log("Image exported successfully to:", destPath);
      return destPath;
    } catch (err) {
      console.error("Error exporting image:", err);
      throw new Error("Failed to export the image.");
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});