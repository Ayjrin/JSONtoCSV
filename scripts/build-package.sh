#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create dist directory if it doesn't exist
mkdir -p "$DIR/dist"

# Create a zip file with all the necessary files for the web application
echo "Creating redistributable package..."

# Create a simple HTML wrapper that includes everything inline
cat > "$DIR/dist/index.html" << EOL
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON to CSV Converter</title>
    <style>
$(cat "$DIR/src/styles.css")
    </style>
</head>
<body>
    <div class="container">
        <h1>JSON to CSV Converter</h1>
        
        <div class="converter-container">
            <div class="input-section">
                <h2>JSON Input</h2>
                <div class="drop-area" id="dropArea">
                    <p>Drag & drop JSON file here</p>
                    <p>or</p>
                    <label for="fileInput" class="upload-btn">Choose File</label>
                    <input type="file" id="fileInput" accept=".json" hidden>
                </div>
                <textarea id="jsonInput" placeholder="Or paste your JSON here..."></textarea>
                <p id="inputFileName" class="file-name"></p>
            </div>
            
            <button id="convertBtn" class="convert-btn" disabled>
                <span class="arrow">→</span>
            </button>
            
            <div class="output-section">
                <h2>CSV Output</h2>
                <div class="output-display" id="csvOutput"></div>
                <button id="downloadBtn" class="download-btn" disabled>Download CSV</button>
            </div>
        </div>
    </div>
    
    <script>
$(cat "$DIR/src/script.js")
    </script>
</body>
</html>
EOL

# Create a ZIP file that can be distributed
cd "$DIR"
zip -r "dist/JSON-to-CSV-Converter.zip" dist/index.html README.md

echo "Package created: $DIR/dist/JSON-to-CSV-Converter.zip"
echo "This ZIP file contains a standalone HTML application that can be used on any platform."
echo "Instructions:"
echo "1. Extract the ZIP file"
echo "2. Open index.html in any web browser"
echo "3. Enjoy the JSON to CSV converter!"
