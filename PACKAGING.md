# Creating Installable Packages for JSON to CSV Converter

This guide explains how to create installable packages for Windows, macOS, and Linux so that users can launch the application from their system's application launcher.

## Prerequisites

- Node.js installed on your build machine
- Git (optional, for cloning repositories)

## Windows (.exe installer)

### Setup on Windows

1. Clone or download this project to your Windows computer
2. Open a command prompt or PowerShell in the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Build the Windows installer:
   ```
   npm run build:win
   ```
5. The installer will be created in the `dist` directory as `JSON to CSV Setup.exe`
6. Share this installer with Windows users

### For Windows Users

1. Run the installer (`JSON to CSV Setup.exe`)
2. Follow the installation prompts
3. After installation, the app can be launched by:
   - Clicking the desktop shortcut (if created during installation)
   - Opening the Start menu, typing "JSON to CSV", and clicking the app
   - Finding it in the Start menu under the "Recently added" section

## macOS (.dmg installer)

### Setup on macOS

1. Clone or download this project to your Mac
2. Open Terminal in the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Build the macOS installer:
   ```
   npm run build:mac
   ```
5. The installer will be created in the `dist` directory as `JSON to CSV.dmg`
6. Share this DMG file with macOS users

### For macOS Users

1. Mount the DMG file by double-clicking it
2. Drag the application to the Applications folder
3. Launch the app from:
   - Launchpad
   - Applications folder
   - Spotlight search (Cmd+Space, then type "JSON to CSV")

## Linux (AppImage and .deb packages)

### Setup on Linux

1. Clone or download this project to your Linux machine
2. Open a terminal in the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Build the Linux packages:
   ```
   npm run build:linux
   ```
5. The packages will be created in the `dist` directory:
   - AppImage: `JSON to CSV-x.y.z.AppImage` (works on most Linux distributions)
   - DEB: `json-to-csv_x.y.z_amd64.deb` (for Debian/Ubuntu-based distributions)
6. Share these packages with Linux users

### For Linux Users (AppImage)

1. Make the AppImage executable:
   ```
   chmod +x "JSON to CSV-x.y.z.AppImage"
   ```
2. Run the AppImage:
   ```
   ./JSON\ to\ CSV-x.y.z.AppImage
   ```
3. The app should automatically create a desktop entry and can be launched from the application menu

### For Linux Users (DEB package)

1. Install the DEB package:
   ```
   sudo dpkg -i json-to-csv_x.y.z_amd64.deb
   sudo apt-get install -f  # To fix dependencies if needed
   ```
2. Launch the app from the application menu or by typing "JSON to CSV" in the system search

## Using GitHub Actions for Cross-Platform Building

If you want to build for all platforms without setting up each development environment, you can use GitHub Actions:

1. Push your project to a GitHub repository
2. Create a workflow file at `.github/workflows/build.yml` with the following content:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    
    steps:
      - name: Check out Git repository
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
          
      - name: Install dependencies
        run: npm install
        
      - name: Build Electron app
        run: |
          if [ "${{ matrix.os }}" = "windows-latest" ]; then
            npm run build:win
          elif [ "${{ matrix.os }}" = "macos-latest" ]; then
            npm run build:mac
          else
            npm run build:linux
          fi
        shell: bash
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/
          
      - name: Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: |
            dist/*.exe
            dist/*.dmg
            dist/*.AppImage
            dist/*.deb
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

3. Create a new git tag and push it to trigger the workflow:
   ```
   git tag v1.0.0
   git push --tags
   ```
4. GitHub Actions will build the application for all platforms and create a new release with the installers

## Alternative: Tauri (Smaller, Faster Alternative to Electron)

[Tauri](https://tauri.app/) is a modern alternative to Electron that produces smaller binaries and uses less memory. It uses the system's native WebView instead of bundling Chromium.

To convert this project to Tauri, you would need to:

1. Install Rust and Tauri CLI
2. Initialize a new Tauri project
3. Move your web application code to the Tauri project
4. Build for all platforms

This is a more advanced option but results in much smaller binaries (can be 10x smaller than Electron).
