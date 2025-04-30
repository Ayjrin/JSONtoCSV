# JSON to CSV Converter

A desktop application that converts JSON data to CSV format. The app can be installed on Windows, macOS, and Linux, allowing users to launch it directly from their system's application launcher.

## Features

- Drag and drop JSON files
- Paste JSON directly into the text area
- Convert JSON to CSV with a single click
- Download the resulting CSV file
- Preserves the original filename with .csv extension
- Built as a desktop application for easy access
- No internet connection required

## For Users

### Installation

Download the appropriate installer for your operating system from the releases section:

- **Windows**: Run the `JSON to CSV Setup.exe` installer
- **macOS**: Mount the `JSON to CSV.dmg` file and drag the app to your Applications folder
- **Linux**: Use either the AppImage or .deb package

### How to Use

1. Launch the app from your system's application launcher (Start menu, Launchpad, etc.)
2. Either:
   - Drag and drop a JSON file onto the drop area
   - Click the drop area to select a JSON file
   - Paste JSON data directly into the text area
3. Click the arrow button in the middle to convert the JSON to CSV
4. Review the CSV output
5. Click the "Download CSV" button to save the CSV file

### Supported JSON Formats

- Arrays of objects (most common format)
- Single objects
- Nested structures (will be properly escaped in CSV)

## For Developers

### Project Structure

```
jsontocsv/
├── assets/            # Application assets (icons, etc.)
├── scripts/           # Utility scripts
├── src/               # Source code for the application
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles
│   └── script.js      # Application logic
├── main.js            # Electron main process
├── preload.js         # Electron preload script
├── package.json       # Project configuration
└── README.md          # This file
```

### Development Setup

```bash
# Clone the repository
git clone [repository-url]
cd jsontocsv

# Install dependencies
npm install

# Start the application in development mode
npm start
```

### Building for Distribution

See [PACKAGING.md](PACKAGING.md) for detailed instructions on building installers for different operating systems.

## Privacy

- All processing happens locally on your device
- No data is sent to any server
- No analytics or tracking
- No internet connection required

## License

MIT

# JSONtoCSV
