const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (...args) => ipcRenderer.invoke(...args),
  },
});

// Suppress Autofill-related errors
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes("'Autofill.enable' wasn't found") ||
    args[0]?.includes("'Autofill.setAddresses' wasn't found")
  ) {
    return; // Suppress Autofill errors
  }
  originalConsoleError(...args); // Log other errors as usual
};