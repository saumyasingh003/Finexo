import React, { useState} from 'react';
import axios, { AxiosResponse, AxiosProgressEvent } from 'axios';
import toast, { Toaster } from 'react-hot-toast';

interface FileError {
  sheet: string;
  row: number;
  errors: string[];
}

interface DataRow {
  name: string;
  amount: string | number;
  date: string;
  verified?: boolean | string;
  sheet: string;
}

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  isProcessing: boolean;
}

const FileUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FileError[]>([]);
  const [sheets, setSheets] = useState<string[]>([]);
  const [data, setData] = useState<DataRow[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<DataRow[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    isProcessing: false
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileDrop = (files: FileList | null) => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('excel_file', files[0]);

      setUploadProgress({
        isUploading: true,
        progress: 0,
        isProcessing: false
      });

      axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          
          setUploadProgress(prev => ({
            ...prev,
            progress,
            isProcessing: progress === 100
          }));
        },
      })
        .then((response: AxiosResponse) => {
          const { errors, sheets, data } = response.data;
          setFile(files[0]);
          setErrors(errors);
          setSheets(sheets);
          setData(data);
          setUploadProgress({
            isUploading: false,
            progress: 100,
            isProcessing: false
          });
        })
        .catch((err: Error) => {
          console.error('Error uploading file:', err);
          toast.error('Error uploading file');
          setUploadProgress({
            isUploading: false,
            progress: 0,
            isProcessing: false
          });
        });
    }
  };

  
  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileDrop(e.dataTransfer.files);
  };


  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileDrop(e.target.files);
  };

  
  const toggleModal = (): void => {
    setIsModalOpen(!isModalOpen);
  };

   const handleSheetSelection = (sheetName: string): void => {
    const sheetData = data.filter(item => item.sheet === sheetName);
    setSelectedSheet(sheetData);
  };

  
  const formatDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return new Date(date).toLocaleDateString('en-GB', options);
  };


  const formatAmount = (amount: string | number | null | undefined): string => {
    // Convert string to number if needed and handle invalid/empty values
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (numAmount === null || numAmount === undefined || isNaN(Number(numAmount))) {
      return '0.00';
    }

    try {
      return Number(numAmount).toLocaleString('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  };

  
  const formatVerified = (verified: boolean | string | undefined | null): string => {
    if (verified === undefined || verified === null) {
      return 'No';
    }
    if (typeof verified === 'string') {
      return verified.toLowerCase() === 'yes' ? 'Yes' : 'No';
    }
    return verified ? 'Yes' : 'No';
  };

    const handleRowDelete = (rowIndex: number): void => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      const updatedData = selectedSheet?.filter((_, index) => index !== rowIndex) ?? [];
      setSelectedSheet(updatedData);
    }
  };

  const handleImport = (): void => {
    const loadingToast = toast.loading('Importing data...');
    
    axios.post('http://localhost:8000/api/import', { 
      data: selectedSheet,
      errors: errors
    })
      .then((response: AxiosResponse) => {
        toast.dismiss(loadingToast);
        toast.success(
          `Successfully imported ${response.data.imported_count} rows! ${response.data.skipped_count} rows skipped.`,
          {
            duration: 5000,
            position: 'top-right',
          }
        );
      })
      .catch((error: Error) => {
        toast.dismiss(loadingToast);
        toast.error('Failed to import data. Please try again.', {
          duration: 5000,
          position: 'top-right',
        });
        console.error('Error importing data:', error);
      });
  };

 
  const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
         
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onClick={handleDropZoneClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop your Excel file here, or click to select
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Only .xlsx or .xls files up to 2MB
              </p>
            </div>

            {uploadProgress.isUploading && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-blue-700">
                    {uploadProgress.progress === 100 ? 'Processing...' : 'Uploading...'}
                  </span>
                  <span className="text-sm font-medium text-blue-700">
                    {uploadProgress.progress}%
                  </span>
                </div>
                <ProgressBar progress={uploadProgress.progress} />
              </div>
            )}
            
            {uploadProgress.isProcessing && (
              <div className="mt-4 flex items-center justify-center text-blue-700">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing your file...
              </div>
            )}
          </div>

          {file && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Uploaded File: {file.name}
                </h3>
                {errors?.length > 0 && (
                  <button 
                    onClick={toggleModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Errors
                  </button>
                )}
              </div>

              
              {sheets?.length > 0 && (
                <div className="mt-6">
                  <label htmlFor="sheet" className="block text-sm font-medium text-gray-700">
                    Select Sheet
                  </label>
                  <select
                    id="sheet"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-black border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    onChange={(e) => handleSheetSelection(e.target.value)}
                  >
                    <option value="">Choose a sheet</option>
                    {sheets.map((sheet, idx) => (
                      <option key={idx} value={sheet}>
                        {sheet}
                      </option>
                    ))}
                  </select>
                </div>
              )}

         
              {selectedSheet && selectedSheet.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
                    <button
                      onClick={handleImport}
                      disabled={uploadProgress.isProcessing}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white cursor-pointer 
                        ${uploadProgress.isProcessing 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-900 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        }`}
                    >
                      {uploadProgress.isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg 
                            className="h-5 w-5 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                          Import Data
                        </>
                      )}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedSheet.map((row, index) => {
                          const hasError = errors.some(error => error.row === index + 2);
                          return (
                            <tr 
                              key={index}
                              className={hasError ? 'bg-red-50' : 'hover:bg-gray-50'}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatAmount(row.amount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row.date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  row.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {formatVerified(row.verified)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <button
                                  onClick={() => handleRowDelete(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

     
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Validation Errors
                  </h3>
                  <div className="mt-4">
                    {errors.map((error, idx) => (
                      <div key={idx} className="mb-4 text-left">
                        <h5 className="font-medium text-gray-900">Sheet: {error.sheet}</h5>
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                          {error.errors.map((rowError, rowIdx) => (
                            <li key={rowIdx} className="text-sm text-red-600">
                              Row {error.row}: {rowError}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
                  onClick={toggleModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;
