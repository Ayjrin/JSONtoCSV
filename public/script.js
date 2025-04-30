document.addEventListener('DOMContentLoaded', function() {
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
    let droppedFile = null; // Store the dropped file for API integration
    
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
                fileName = file.name.replace('.json', '');
                inputFileName.textContent = `File: ${file.name}`;
                
                // Store the file for API integration
                droppedFile = file;
                
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
    dropArea.addEventListener('click', function() {
        fileInput.click();
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
            
            // Check if we're in Electron environment
            if (window.electronAPI) {
                // Use Electron's IPC for file saving
                window.electronAPI.saveFile({
                    fileName: outputFileName,
                    csvContent: csvData
                }).then(result => {
                    if (result.success) {
                        alert(`CSV file saved to: ${result.filePath}`);
                    }
                }).catch(err => {
                    console.error('Failed to save file:', err);
                    // Fallback to browser download if Electron save fails
                    downloadCSV(csvData, outputFileName);
                });
            } else {
                // Check if we're on Vercel deployment
                if (window.location.hostname.includes('vercel.app')) {
                    // Use the API endpoint to convert and download
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
                } else {
                    // Standard browser download if not on Vercel or in Electron
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
