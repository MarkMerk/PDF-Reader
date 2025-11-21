import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// NOTE: This assumes you have Tailwind CSS set up for the class names

const VariableTableDisplay = ({ 
    variables, 
    filename, 
    onVariableChange,
    onAddVariable,
    onRemoveVariable,
    onRefine,
    isLoading
}) => {
    
    if (!variables || variables.length === 0) {
        return (
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xl h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-extrabold text-indigo-700 mb-4">
                    Analysis Complete
                </h2>
                <p className="text-lg text-gray-600">No variables were extracted from the document by the LLM.</p>
                
                <button
                    onClick={onAddVariable}
                    disabled={isLoading}
                    className="mt-6 px-6 py-3 text-sm font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition duration-150 shadow-lg"
                >
                    + Add First Variable
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xl h-full flex flex-col">
            <h2 className="text-2xl font-extrabold text-indigo-700 mb-4 flex items-center border-b pb-3">
                {/* Иконка списка/таблицы */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-6 w-6 text-indigo-500">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
                Extracted Variables Documentation
            </h2>
            
            {/* FIX: Changed <p> to <div> to resolve DOM Nesting Warning */}
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex justify-between items-center">
                <span>Source Document: <span className="text-gray-800 normal-case font-medium">{filename}</span></span>
                
                {/* --- REFINEMENT CONTROLS --- */}
                <div className="space-x-2 flex items-center">
                    <button
                        onClick={onAddVariable}
                        disabled={isLoading}
                        className="px-4 py-2 text-xs font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition duration-150 shadow-md"
                    >
                        + Add Variable
                    </button>
                    <button
                        onClick={onRefine}
                        disabled={isLoading}
                        className={`px-4 py-2 text-xs font-bold text-white rounded-full transition duration-150 shadow-md flex items-center ${
                            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isLoading ? 'Refining...' : 'Refine with LLM'}
                    </button>
                </div>
            </div>
            {/* END FIX */}

            <div className="overflow-x-auto overflow-y-auto flex-grow rounded-lg border border-gray-200 shadow-inner">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* Table Header MODIFIED */}
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                                Field Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                                Value
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                                Action
                            </th>
                        </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {variables.map((variable, index) => (
                            <tr key={index} className="hover:bg-indigo-50 transition duration-150">
                                
                                {/* Editable Field Name (Was Type) */}
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <input
                                        type="text"
                                        value={variable.field_name || ''}
                                        onChange={(e) => onVariableChange(index, 'field_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500 bg-purple-50 text-purple-800 font-semibold text-xs"
                                        placeholder="Variable Name/Category"
                                        disabled={isLoading}
                                    />
                                </td>
                                
                                {/* Editable Value (Was Name) */}
                                <td className="px-6 py-2 whitespace-nowrap">
                                    <input
                                        type="text"
                                        value={variable.value || ''}
                                        onChange={(e) => onVariableChange(index, 'value', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Extracted Value"
                                        disabled={isLoading}
                                    />
                                </td>
                                
                                {/* Editable Type (Existing Type field, just moved) */}
                                <td className="px-6 py-2 whitespace-nowrap">
                                    <input
                                        type="text"
                                        value={variable.type || ''}
                                        onChange={(e) => onVariableChange(index, 'type', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                        placeholder="Type"
                                        disabled={isLoading}
                                    />
                                </td>
                                
                                {/* Editable Description */}
                                <td className="px-6 py-2 text-sm text-gray-500">
                                    <textarea
                                        rows="2"
                                        value={variable.description || ''}
                                        onChange={(e) => onVariableChange(index, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-1 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Context and description"
                                        disabled={isLoading}
                                    />
                                </td>
                                
                                {/* Action Button (Remove) */}
                                <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onRemoveVariable(index)}
                                        disabled={isLoading}
                                        className="text-red-600 hover:text-red-900 transition duration-150 disabled:opacity-50"
                                        title="Remove variable"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 100 2v6a1 1 0 100-2V8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                <p className="font-semibold">💡 Tip:</p>
                <p>Modify any field, add new blank rows, or remove unnecessary variables. Then click **Refine with LLM** to have the AI attempt to complete or correct the data based on the original document text.</p>
            </div>
        </div>
    );
};

// --- Компонент App (Главный компонент) ---
const App = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    // State to hold the full analysis response (includes text)
    const [analysisData, setAnalysisData] = useState(null); 
    // State to hold the variables currently displayed/edited in the table
    const [editableVariables, setEditableVariables] = useState([]); 
    const [error, setError] = useState(null);

    const API_URL = 'http://127.0.0.1:8000/analyze-pdf';
    const REFINE_API_URL = 'http://127.0.0.1:8000/refine-variables';

    const handleFileChange = (event) => {
        // Clear old results on new file selection
        setAnalysisData(null); 
        setEditableVariables([]);
        setError(null);
        
        const file = event.target.files ? event.target.files[0] : null;
        
        if (previewUrl) URL.revokeObjectURL(previewUrl); 

        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl('');
            setError("Please select a valid PDF file."); 
        }
    };

    const handleUpload = useCallback(async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError("Please select a PDF file before uploading."); 
            return;
        }

        setIsLoading(true);
        setAnalysisData(null); // Clear previous results
        setEditableVariables([]);
        setError(null);

        const formData = new FormData();
        formData.append("pdf_file", selectedFile);

        const maxRetries = 3;
        let lastError = null;
        let result = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                });

                const responseText = await response.text();
                
                if (!response.ok) {
                    let errorDetail = `HTTP error! Status: ${response.status}`;
                    try {
                        const errorData = JSON.parse(responseText);
                        errorDetail = errorData.detail || errorDetail;
                    } catch(e) {
                        errorDetail = `HTTP error! Status: ${response.status}. Response: ${responseText.substring(0, 100)}`;
                    }
                    throw new Error(errorDetail);
                }
                
                if (!responseText) {
                    throw new Error("Server returned 200 OK, but the response body was empty.");
                }
                
                result = JSON.parse(responseText);
                lastError = null; // Success
                break; 
                
            } catch (err) {
                lastError = err;
                console.error(`API Call Error (Attempt ${attempt + 1}):`, err);
                if (attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        if (lastError) {
           setError(`Analysis Failed: ${lastError.message}. Please check if the FastAPI backend is running.`); 
        } else if (result) {
            setAnalysisData(result); // Store full response (including document_text)
            setEditableVariables(result.variables); // Initialize editable variables
        }
        setIsLoading(false);

    }, [selectedFile]); 

    // --- NEW: Refinement Handler ---
    const handleRefine = useCallback(async () => {
        if (!analysisData || editableVariables.length === 0) return;
        
        setIsLoading(true);
        setError(null);

        try {
            // Use the original document_text from analysisData and the current editable variables
            const refinementPayload = {
                document_text: analysisData.document_text,
                current_variables: editableVariables,
            };

            const response = await fetch(REFINE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(refinementPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            
            // Update the variables in the editable state with the LLM's refined list
            setEditableVariables(result.variables); 
            // Also update the main analysisData variable list (keeping the original text)
            setAnalysisData(prev => ({ ...prev, variables: result.variables }));

        } catch (err) {
            setError(`Refinement Failed: ${err.message}. Ensure your fields have valid, corresponding text in the PDF.`);
            console.error('Refinement API Call Error:', err);
        } finally {
            setIsLoading(false);
        }

    }, [analysisData, editableVariables]);

    // --- NEW: Variable Change Handler (Used by the table inputs) ---
    const handleVariableChange = useCallback((index, field, value) => {
        setEditableVariables(prevVariables => 
            prevVariables.map((variable, i) => 
                i === index ? { ...variable, [field]: value } : variable
            )
        );
    }, []);

    // --- NEW: Add Variable Handler ---
    const handleAddVariable = useCallback(() => {
        setEditableVariables(prevVariables => [
            ...prevVariables,
            // Use new fields: field_name and value
            { field_name: '', value: '', type: 'user_added_field', description: 'New variable added by user. Click Refine to fill details.' }
        ]);
    }, []);
    
    // --- NEW: Remove Variable Handler ---
    const handleRemoveVariable = useCallback((index) => {
        setEditableVariables(prevVariables => 
            prevVariables.filter((_, i) => i !== index)
        );
    }, []);

    // Clean up the URL object when the component unmounts
    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Helper component for PDF Placeholder
    const PdfPlaceholder = ({ file, previewUrl }) => (
        <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500 bg-gray-100 rounded-xl">
            {file ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 000 2h8a1 1 0 100-2H6zm0 4a1 1 0 100 2h8a1 1 0 100-2H6zm0 4a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700">Preview of {file.name} loading...</p>
                    <p className="text-sm">If the PDF doesn't display above, your browser might not support it.</p>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-lg font-semibold">Select a PDF file to see the preview here.</p>
                </>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8 font-sans">
            
            {/* 1. UPLOAD CONTROLS */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-4xl mb-6">
                <header className="text-center mb-6 w-full">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">PDF Variable Extractor</h1>
                    <p className="text-md text-gray-600">Upload a PDF to extract and document technical variables using Ollama.</p>
                </header>
                
                <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-full sm:flex-grow">
                        <label 
                            htmlFor="pdf-upload" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Select PDF File
                        </label>
                        <input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-900 
                                       file:mr-4 file:py-2 file:px-4
                                       file:rounded-full file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-indigo-50 file:text-indigo-700
                                       hover:file:bg-indigo-100 cursor-pointer"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!selectedFile || isLoading}
                        className={`w-full sm:w-auto px-8 py-3 mt-4 sm:mt-0 font-semibold rounded-full shadow-lg transition-all duration-300 flex-shrink-0
                            ${!selectedFile || isLoading 
                              ? 'bg-gray-400 text-gray-700 cursor-not-allowed shadow-none' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl transform hover:scale-[1.02]'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </span>
                        ) : 'Analyze PDF'}
                    </button>
                </form>
                
                {selectedFile && !error && !isLoading && (
                    <p className="text-sm text-gray-500 mt-4 pt-2 border-t">File selected: <span className="font-medium text-gray-800">{selectedFile.name}</span></p>
                )}
            </div>
            
            {/* 2. Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-xl w-full max-w-7xl shadow-md" role="alert">
                    <p className="font-bold text-lg mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Error:
                    </p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* 3. RESULTS SECTION (PDF PREVIEW + VARIABLE TABLE) */}
            {(previewUrl || analysisData) && (
                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    
                    {/* Left Column: PDF Preview */}
                    <div className="h-[700px] rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
                        <h3 className="text-lg font-bold p-3 bg-gray-800 text-white flex items-center flex-shrink-0">
                            {selectedFile ? selectedFile.name : "PDF Document"}
                        </h3>
                        <div className="flex-grow">
                            {previewUrl ? (
                                <iframe 
                                    src={previewUrl} 
                                    title="PDF Preview"
                                    className="w-full h-full bg-white"
                                    style={{ border: 'none' }}
                                >
                                    <PdfPlaceholder file={selectedFile} previewUrl={previewUrl} />
                                </iframe>
                            ) : (
                                <PdfPlaceholder file={selectedFile} previewUrl={previewUrl} />
                            )}
                        </div>
                    </div>

                    {/* Right Column: Analysis Results */}
                    <div className="h-[700px]">
                        {editableVariables.length > 0 || isLoading ? (
                            <VariableTableDisplay 
                                variables={editableVariables} 
                                filename={analysisData?.filename || (selectedFile?.name || "N/A")}
                                onVariableChange={handleVariableChange} 
                                onAddVariable={handleAddVariable}
                                onRemoveVariable={handleRemoveVariable}
                                onRefine={handleRefine}
                                isLoading={isLoading}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-6 bg-white border border-gray-200 rounded-xl shadow-2xl text-gray-500">
                                <p className="text-lg font-semibold">Variable documentation will appear here after analysis.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);