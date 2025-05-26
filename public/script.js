document.addEventListener('DOMContentLoaded', function() {
    // API Dropdown Toggle
    const apiDropdownBtn = document.getElementById('apiDropdownBtn');
    const apiDropdownContent = document.getElementById('apiDropdownContent');
    
    if (apiDropdownBtn && apiDropdownContent) {
        apiDropdownBtn.addEventListener('click', function() {
            apiDropdownContent.classList.toggle('show');
            
            // Change the dropdown arrow
            if (apiDropdownContent.classList.contains('show')) {
                apiDropdownBtn.innerHTML = 'API Documentation ▲';
            } else {
                apiDropdownBtn.innerHTML = 'API Documentation ▼';
            }
        });
        
        // Close the dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!apiDropdownBtn.contains(event.target) && !apiDropdownContent.contains(event.target)) {
                apiDropdownContent.classList.remove('show');
                apiDropdownBtn.innerHTML = 'API Documentation ▼';
            }
        });
    }
    
    // DOM Elements
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const jsonInput = document.getElementById('jsonInput');
    const convertBtn = document.getElementById('convertBtn');
    const csvOutput = document.getElementById('csvOutput');
    const downloadBtn = document.getElementById('downloadBtn');
    const inputFileName = document.getElementById('inputFileName');
    
    // Variables
    let fileName = '';
    let csvData = '';
    let droppedFile = null;
    
    // Event Listeners for Drag and Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('active');
    }
    
    function unhighlight() {
        dropArea.classList.remove('active');
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle file input change
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Handle files
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                droppedFile = file; // Store the file object
                fileName = file.name.replace('.json', '');
                inputFileName.textContent = `File: ${file.name}`;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    jsonInput.value = e.target.result;
                    validateInput();
                };
                reader.readAsText(file);
            } else {
                alert('Please upload a JSON file');
            }
        }
    }
    
    // Click on drop area to trigger file input
    dropArea.addEventListener('click', function(e) {
        // Only trigger file input if the click wasn't on the file input itself
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    // Prevent clicks on the file input from bubbling up to the drop area
    fileInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Validate JSON input
    jsonInput.addEventListener('input', validateInput);
    
    function validateInput() {
        try {
            const json = jsonInput.value.trim();
            if (json) {
                JSON.parse(json);
                convertBtn.disabled = false;
            } else {
                convertBtn.disabled = true;
            }
        } catch (e) {
            convertBtn.disabled = true;
        }
    }
    
    // Convert JSON to CSV
    convertBtn.addEventListener('click', function() {
        try {
            const jsonData = JSON.parse(jsonInput.value);
            csvData = jsonToCSV(jsonData);
            csvOutput.textContent = csvData;
            downloadBtn.disabled = false;
        } catch (e) {
            csvOutput.textContent = 'Error: Invalid JSON format';
            downloadBtn.disabled = true;
        }
    });
    
    // Download CSV file
    downloadBtn.addEventListener('click', function() {
        if (csvData) {
            const outputFileName = fileName ? `${fileName}.csv` : 'data.csv';
            
            // Use the server API for conversion when possible
            if (fileName && droppedFile) {
                // If we have a file, use the file upload endpoint
                const formData = new FormData();
                formData.append('jsonFile', droppedFile);
                
                fetch('/api/convert/file', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = outputFileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Fallback to client-side download
                    downloadCSV(csvData, outputFileName);
                });
            } else {
                // If we're working with pasted JSON, use the direct conversion endpoint
                try {
                    const jsonData = JSON.parse(jsonInput.value);
                    fetch('/api/convert', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(jsonData)
                    })
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = outputFileName;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // Fallback to client-side download
                        downloadCSV(csvData, outputFileName);
                    });
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    // Fallback to client-side download
                    downloadCSV(csvData, outputFileName);
                }
            }
        }
    });
    
    // JSON to CSV conversion logic
    function jsonToCSV(jsonData) {
        // Handle array of objects
        if (Array.isArray(jsonData) && jsonData.length > 0) {
            // Get headers from the first object
            const headers = Object.keys(jsonData[0]);
            
            // Create CSV rows
            const csvRows = [];
            
            // Add header row
            csvRows.push(headers.join(','));
            
            // Add data rows
            for (const row of jsonData) {
                const values = headers.map(header => {
                    const value = row[header];
                    // Handle nested objects and arrays
                    const cellValue = typeof value === 'object' && value !== null 
                        ? JSON.stringify(value).replace(/"/g, '""') 
                        : value;
                    
                    // Escape commas and quotes
                    return `"${cellValue}"`;
                });
                csvRows.push(values.join(','));
            }
            
            return csvRows.join('\n');
        } 
        // Handle single object
        else if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
            const headers = Object.keys(jsonData);
            const values = headers.map(header => {
                const value = jsonData[header];
                const cellValue = typeof value === 'object' && value !== null 
                    ? JSON.stringify(value).replace(/"/g, '""') 
                    : value;
                
                return `"${cellValue}"`;
            });
            
            return headers.join(',') + '\n' + values.join(',');
        }
        else {
            throw new Error('Invalid JSON format. Expected an object or array of objects.');
        }
    }
    
    // Download CSV file via browser
    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
