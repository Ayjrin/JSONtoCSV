const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request body
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Advanced JSON to CSV conversion function that handles various JSON structures
function jsonToCSV(jsonData) {
  // Strategy pattern to handle different JSON structures
  if (Array.isArray(jsonData)) {
    // Case 1: Direct array of objects - most common JSON API response format
    if (jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0] !== null) {
      return convertArrayOfObjects(jsonData);
    } 
    // Case 2: Array of primitive values
    else if (jsonData.length > 0) {
      return convertArrayOfPrimitives(jsonData);
    }
    // Empty array
    return 'Empty array';
  } 
  // Case 3: Object with properties
  else if (typeof jsonData === 'object' && jsonData !== null) {
    // Case 3a: Object with arrays as values (like keyed collections)
    const keys = Object.keys(jsonData);
    const hasArrayValues = keys.some(key => Array.isArray(jsonData[key]));
    
    if (hasArrayValues) {
      return convertObjectWithArrays(jsonData);
    }
    
    // Case 3b: Single flat object
    return convertSingleObject(jsonData);
  }
  // Case 4: Primitive value
  else {
    return `Value\n"${jsonData}"`;
  }
}

// Converts an array of objects to CSV
function convertArrayOfObjects(array) {
  if (array.length === 0) return '';
  
  // Extract all possible headers from all objects
  const allHeaders = new Set();
  array.forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => allHeaders.add(key));
    }
  });
  
  const headers = Array.from(allHeaders);
  if (headers.length === 0) return '';
  
  // Create CSV rows
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const item of array) {
    if (!item || typeof item !== 'object') {
      // Handle non-object items in the array
      csvRows.push(`"${item}",`.repeat(headers.length - 1) + `"${item}"`);
      continue;
    }
    
    const values = headers.map(header => {
      // Handle missing properties
      if (!(header in item)) return '""';
      
      const value = item[header];
      
      // Handle null and undefined
      if (value === null || value === undefined) return '""';
      
      // Handle nested objects and arrays
      const cellValue = typeof value === 'object' 
        ? JSON.stringify(value).replace(/"/g, '""') 
        : value;
      
      // Escape commas and quotes
      return `"${cellValue}"`;
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Converts an array of primitive values to CSV
function convertArrayOfPrimitives(array) {
  if (array.length === 0) return '';
  
  const csvRows = ['value'];
  
  for (const item of array) {
    csvRows.push(`"${item}"`);
  }
  
  return csvRows.join('\n');
}

// Converts a single object to CSV
function convertSingleObject(obj) {
  const headers = Object.keys(obj);
  if (headers.length === 0) return '';
  
  const values = headers.map(header => {
    const value = obj[header];
    
    // Handle null and undefined
    if (value === null || value === undefined) return '""';
    
    // Handle nested objects and arrays
    const cellValue = typeof value === 'object' 
      ? JSON.stringify(value).replace(/"/g, '""') 
      : value;
    
    return `"${cellValue}"`;
  });
  
  return headers.join(',') + '\n' + values.join(',');
}

// Converts an object where some values are arrays
function convertObjectWithArrays(obj) {
  const keys = Object.keys(obj);
  if (keys.length === 0) return '';
  
  let result = '';
  let isFirstSection = true;
  
  for (const key of keys) {
    const value = obj[key];
    
    if (Array.isArray(value) && value.length > 0) {
      // Add a separator between sections
      if (!isFirstSection) {
        result += '\n\n';
      } else {
        isFirstSection = false;
      }
      
      // Handle array of objects
      if (typeof value[0] === 'object' && value[0] !== null) {
        // Add section header
        result += `## ${key.toUpperCase()} ##\n`;
        // Convert the array of objects
        result += convertArrayOfObjects(value);
      } 
      // Handle array of primitives
      else {
        // Add section header
        result += `## ${key.toUpperCase()} ##\n`;
        result += convertArrayOfPrimitives(value);
      }
    } 
    // Handle non-array values by adding them as key-value pairs
    else if (!Array.isArray(value) || value.length === 0) {
      if (!isFirstSection) {
        result += '\n\n';
      } else {
        isFirstSection = false;
      }
      
      // Add section header
      result += `## ${key.toUpperCase()} ##\n`;
      
      // Handle primitive value
      if (typeof value !== 'object' || value === null) {
        result += `value\n"${value}"`;
      }
      // Handle nested object
      else {
        result += convertSingleObject(value);
      }
    }
  }
  
  return result;
}

// POST endpoint to convert JSON to CSV from request body
app.post('/convert', (req, res) => {
  try {
    const jsonData = req.body;
    
    // Validate JSON data
    if (!jsonData || (typeof jsonData !== 'object') || 
        (Array.isArray(jsonData) && jsonData.length === 0)) {
      return res.status(400).json({ 
        error: 'Invalid JSON data. Expected a non-empty object or array of objects.' 
      });
    }
    
    // Convert JSON to CSV
    const csvData = jsonToCSV(jsonData);
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
    
    // Send CSV data
    res.send(csvData);
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint to convert JSON file to CSV
app.post('/convert/file', upload.single('jsonFile'), (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get original filename
    const originalFilename = req.file.originalname;
    const filenameWithoutExt = originalFilename.replace('.json', '');
    const csvFilename = `${filenameWithoutExt}.csv`;
    
    // Parse JSON from file buffer
    const jsonString = req.file.buffer.toString('utf8');
    let jsonData;
    
    try {
      jsonData = JSON.parse(jsonString);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON file: ' + parseError.message });
    }
    
    // Validate JSON data
    if (!jsonData || (typeof jsonData !== 'object') || 
        (Array.isArray(jsonData) && jsonData.length === 0)) {
      return res.status(400).json({ 
        error: 'Invalid JSON data. Expected a non-empty object or array of objects.' 
      });
    }
    
    // Convert JSON to CSV
    const csvData = jsonToCSV(jsonData);
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${csvFilename}"`);
    
    // Send CSV data
    res.send(csvData);
  } catch (error) {
    console.error('Error converting JSON file to CSV:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'JSON to CSV API is running' });
});

// Serve a simple documentation page at root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>JSON to CSV API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
        }
        code {
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <h1>JSON to CSV Converter API</h1>
      <p>This API allows you to convert JSON data to CSV format.</p>
      
      <h2>Endpoints</h2>
      
      <h3>1. Convert JSON data</h3>
      <pre>POST /convert</pre>
      <p>Send a JSON object or array of objects in the request body and receive a CSV file in response.</p>
      <p>Example:</p>
      <pre>
curl -X POST -H "Content-Type: application/json" -d '[{"name":"John","age":30},{"name":"Jane","age":25}]' http://localhost:${port}/convert -o data.csv
      </pre>
      
      <h3>2. Convert JSON file</h3>
      <pre>POST /convert/file</pre>
      <p>Upload a JSON file using multipart/form-data and receive a CSV file in response.</p>
      <p>Example:</p>
      <pre>
curl -X POST -F "jsonFile=@data.json" http://localhost:${port}/convert/file -o data.csv
      </pre>
      
      <h3>3. Health check</h3>
      <pre>GET /health</pre>
      <p>Check if the API is running properly.</p>
      <p>Example:</p>
      <pre>
curl http://localhost:${port}/health
      </pre>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`JSON to CSV API running on http://localhost:${port}`);
});
