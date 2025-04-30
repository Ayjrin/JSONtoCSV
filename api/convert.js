const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create a router for this endpoint
const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Parse JSON request body
app.use(express.json({ limit: '50mb' }));

// Function to convert JSON to CSV
function jsonToCSV(jsonData) {
  let csv = '';
  
  // Handle different types of JSON structures
  if (typeof jsonData !== 'object' || jsonData === null) {
    // Handle primitive values
    csv = 'value\n';
    csv += `"${jsonData}"\n`;
  } else if (Array.isArray(jsonData)) {
    if (jsonData.length === 0) {
      return 'Empty array';
    }
    
    // Check if array contains objects with the same structure
    const firstItem = jsonData[0];
    const allObjectsWithSameKeys = jsonData.every(item => 
      typeof item === 'object' && 
      item !== null && 
      !Array.isArray(item) &&
      Object.keys(firstItem).every(key => Object.prototype.hasOwnProperty.call(item, key))
    );
    
    if (allObjectsWithSameKeys) {
      // Get all unique keys from all objects
      const keys = Array.from(
        new Set(
          jsonData.flatMap(item => Object.keys(item))
        )
      );
      
      // Create header row
      csv = keys.join(',') + '\n';
      
      // Create data rows
      jsonData.forEach(item => {
        const row = keys.map(key => {
          const value = item[key];
          // Handle different value types
          if (value === undefined || value === null) {
            return '""';
          } else if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          } else {
            return `"${String(value).replace(/"/g, '""')}"`;
          }
        }).join(',');
        csv += row + '\n';
      });
    } else {
      // Simple array of primitives or mixed types
      csv = 'value\n';
      jsonData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          csv += `"${JSON.stringify(item).replace(/"/g, '""')}"\n`;
        } else {
          csv += `"${String(item).replace(/"/g, '""')}"\n`;
        }
      });
    }
  } else {
    // Handle object
    // Check if it's a nested structure with different types
    const entries = Object.entries(jsonData);
    const hasNestedComplexStructures = entries.some(([_, value]) => 
      typeof value === 'object' && value !== null && 
      ((Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) ||
       (!Array.isArray(value) && Object.keys(value).length > 0))
    );
    
    if (hasNestedComplexStructures) {
      // Handle each key as a separate section
      let sections = [];
      
      for (const [key, value] of entries) {
        let sectionCsv = `## ${key.toUpperCase()} ##\n`;
        
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          // Array of objects
          sectionCsv += jsonToCSV(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Nested object
          const nestedKeys = Object.keys(value);
          sectionCsv += nestedKeys.join(',') + '\n';
          
          const row = nestedKeys.map(nestedKey => {
            const nestedValue = value[nestedKey];
            if (typeof nestedValue === 'object' && nestedValue !== null) {
              return `"${JSON.stringify(nestedValue).replace(/"/g, '""')}"`;
            } else {
              return `"${String(nestedValue).replace(/"/g, '""')}"`;
            }
          }).join(',');
          
          sectionCsv += row + '\n';
        } else {
          // Array of primitives or single value
          sectionCsv += jsonToCSV(value);
        }
        
        sections.push(sectionCsv);
      }
      
      csv = sections.join('\n');
    } else {
      // Simple flat object
      const keys = Object.keys(jsonData);
      csv = keys.join(',') + '\n';
      
      const values = keys.map(key => {
        const value = jsonData[key];
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
      }).join(',');
      
      csv += values + '\n';
    }
  }
  
  return csv;
}

// API endpoint for direct JSON conversion
app.post('/api/convert', (req, res) => {
  try {
    const jsonData = req.body;
    const csv = jsonToCSV(jsonData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=result.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    res.status(500).send('Error converting JSON to CSV: ' + error.message);
  }
});

// Export the Express API for Vercel serverless functions
module.exports = app;
