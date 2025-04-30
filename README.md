# JSON to CSV Converter

A web application and API that converts JSON data to CSV format. The application is accessible through a web interface and provides API endpoints for programmatic use.

## Features

- Drag and drop JSON files
- Paste JSON directly into the text area
- Convert JSON to CSV with a single click
- Download the resulting CSV file
- Preserves the original filename with .csv extension
- API endpoints for programmatic use
- Handles complex and nested JSON structures

## Web Application

### How to Use

1. Visit the application at [https://convert-json-csv.vercel.app/](https://convert-json-csv.vercel.app/)
2. Either:
   - Drag and drop a JSON file onto the drop area
   - Click the drop area to select a JSON file
   - Paste JSON data directly into the text area
3. Click the arrow button in the middle to convert the JSON to CSV
4. Review the CSV output
5. Click the "Download CSV" button to save the CSV file

## API Documentation

The application provides RESTful API endpoints for converting JSON to CSV programmatically.

### Convert JSON Data

**Endpoint:** `POST /api/convert`

**Request:**
- Content-Type: application/json
- Body: JSON data to convert

**Example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":30}' \
  https://convert-json-csv.vercel.app/api/convert \
  -o result.csv
```

### Convert JSON File

**Endpoint:** `POST /api/convert/file`

**Request:**
- Content-Type: multipart/form-data
- Form field: jsonFile (file upload)

**Example:**
```bash
curl -X POST \
  -F "jsonFile=@path/to/your/file.json" \
  https://convert-json-csv.vercel.app/api/convert/file \
  -o result.csv
```

### Supported JSON Formats

- Arrays of objects (most common format)
- Single objects
- Nested structures (will be properly escaped in CSV)
- Mixed data types

## For Developers

### Project Structure

```
jsontocsv/
├── api/               # API endpoints for Vercel serverless functions
│   ├── convert.js     # Direct JSON conversion endpoint
│   ├── convert/       # File upload conversion endpoint
│   └── index.js       # API root endpoint
├── public/            # Web application files
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles
│   └── script.js      # Application logic
├── server.js          # Express server for local development
├── package.json       # Project configuration
└── README.md          # This file
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Ayjrin/JSONtoCSV.git
cd JSONtoCSV

# Install dependencies
npm install

# Start the application in development mode
npm start
```

### Deployment

The application is deployed on Vercel. Any changes pushed to the main branch will automatically trigger a new deployment.

## Privacy

- All processing happens in your browser or on the server
- No data is stored on the server
- No analytics or tracking

## License

MIT
