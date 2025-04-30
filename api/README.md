# JSON to CSV API

This is a simple API that allows you to convert JSON data to CSV format via HTTP requests.

## Features

- Convert JSON data sent in request body to CSV
- Convert JSON files uploaded via multipart/form-data to CSV
- Maintains the same conversion logic as the desktop application
- Preserves original filename when converting files

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Installation

1. Navigate to the API directory:
   ```
   cd api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

The API will be available at `http://localhost:3000`.

## API Endpoints

### 1. Convert JSON Data

**Endpoint:** `POST /convert`

**Description:** Send JSON data in the request body and receive a CSV file in response.

**Example:**
```bash
curl -X POST -H "Content-Type: application/json" \
     -d '[{"name":"John","age":30},{"name":"Jane","age":25}]' \
     http://localhost:3000/convert -o data.csv
```

### 2. Convert JSON File

**Endpoint:** `POST /convert/file`

**Description:** Upload a JSON file using multipart/form-data and receive a CSV file in response.

**Example:**
```bash
curl -X POST -F "jsonFile=@data.json" \
     http://localhost:3000/convert/file -o output.csv
```

### 3. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the API is running properly.

**Example:**
```bash
curl http://localhost:3000/health
```

## Docker Support

You can also run the API in a Docker container:

```bash
# Build the Docker image
docker build -t json-to-csv-api .

# Run the container
docker run -p 3000:3000 json-to-csv-api
```

## Client Integration

You can integrate this API with your applications using standard HTTP requests. Here are examples in different languages:

### JavaScript (Fetch API)
```javascript
// Send JSON data
async function convertJsonData() {
  const response = await fetch('http://localhost:3000/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ])
  });
  
  if (response.ok) {
    const csvBlob = await response.blob();
    // Create a download link
    const url = window.URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// Upload JSON file
async function convertJsonFile(file) {
  const formData = new FormData();
  formData.append('jsonFile', file);
  
  const response = await fetch('http://localhost:3000/convert/file', {
    method: 'POST',
    body: formData
  });
  
  if (response.ok) {
    const csvBlob = await response.blob();
    // Create a download link
    const url = window.URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.json', '.csv');
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
```

### Python
```python
import requests
import json

# Send JSON data
def convert_json_data():
    data = [
        {"name": "John", "age": 30},
        {"name": "Jane", "age": 25}
    ]
    
    response = requests.post(
        'http://localhost:3000/convert',
        json=data
    )
    
    if response.status_code == 200:
        with open('data.csv', 'wb') as f:
            f.write(response.content)
            
# Upload JSON file
def convert_json_file(file_path):
    with open(file_path, 'rb') as f:
        files = {'jsonFile': (file_path, f)}
        response = requests.post(
            'http://localhost:3000/convert/file',
            files=files
        )
    
    if response.status_code == 200:
        output_file = file_path.replace('.json', '.csv')
        with open(output_file, 'wb') as f:
            f.write(response.content)
```

## Deployment

For production deployment, consider:

1. Adding authentication (API keys, JWT, etc.)
2. Setting up HTTPS
3. Implementing rate limiting
4. Using a process manager like PM2
5. Setting up a reverse proxy with Nginx or Apache

## License

MIT
