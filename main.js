const path = require("path"),
  os = require("os"),
  { app, BrowserWindow, Menu, ipcMain, shell } = require("electron"),
  imagemin = require("imagemin"),
  imagminMozjpeg = require("imagemin-mozjpeg"),
  imageminPngquant = require("imagemin-pngquant"),
  slash = require("slash"),
  imageminMozjpeg = require("imagemin-mozjpeg"),
  log = require("electron-log");

// Set env
process.env.NODE_ENV = "production";

// Identify platform
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.env.NODE_ENV !== "dawrin" ? true : false;

// init mainWindow var
let mainWindow;
let aboutWindow;
// Create "window"
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Shrinkr",
    width: isDev ? 1000 : 500,
    heigh: 600,
    // icon: `assets/icons/Icon_1024x1024.png`,
    resizable: isDev,
    webPreferences: {
      // allow node to run on app
      nodeIntegration: true,
    },
  });
  // designate where application index.html is at
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About ImageShrink",
    width: 450,
    heigh: 450,
    resizable: false,
  });
  // designate where application index.html is at
  aboutWindow.loadFile(`${__dirname}/app/about.html`);
}

app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

const menu = [
  // This will help you see the file option on the menu bar on mac,
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),

  { role: "fileMenu" },

  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: "createAboutWindow",
            },
          ],
        },
      ]
    : []),

  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// From event listener in renderer
ipcMain.on("image:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), "shrinkr");
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    log.info(files);
    shell.openPath(dest);

    mainWindow.webContents.send("image:done");
  } catch (err) {
    log.error(err);
  }
}

// Mac app remains technically open functionality
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
