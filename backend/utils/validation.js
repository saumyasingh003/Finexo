import xlsx from 'xlsx';


export const validateExcel = async (fileBuffer) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const errors = [];
  const allData = [];
  const sheets = workbook.SheetNames;

  
  sheets.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    jsonData.forEach((row, index) => {
      const rowErrors = validateRow(row);
      if (rowErrors.length > 0) {
        errors.push({
          sheet: sheetName,
          row: index + 2, 
          errors: rowErrors
        });
      }

      
      row.sheet = sheetName;
      allData.push(row);
    });
  });

  
  const validRows = allData.filter((row, index) => 
    !errors.some(error => error.row === index + 2)
  );

  return {
    errors,
    validRows,
    sheets,
    data: allData
  };
};

const validateRow = (row) => {
  const errors = [];

  
  if (!row.name || row.name.trim() === '') {
    errors.push('Name is required');
  }

  
  if (!row.amount) {
    errors.push('Amount is required');
  } else {
    const amount = parseFloat(row.amount);
    if (isNaN(amount)) {
      errors.push('Amount must be a valid number');
    } else if (amount < 0) {
      errors.push('Amount cannot be negative');
    }
  }

  
  if (!row.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(row.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }


  if (row.verified !== undefined && row.verified !== null) {
    const verifiedValue = String(row.verified).toLowerCase();
    if (verifiedValue !== 'yes' && verifiedValue !== 'no' && 
        verifiedValue !== 'true' && verifiedValue !== 'false') {
      errors.push('Verified must be Yes or No');
    }
  }

  return errors;
};