const fs = require('fs');
const path = require('path');

// Regular expressions 
const cuilRegex = /^\d{2}-\d{8}-\d{1}$/;
const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
const amountRegex = /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/;

  
const inputFile = 'regular-expressions.csv';
const outputFile = 'bad-debt.csv';

function validateEntry(cuil, dischargeDate, amount, state) {
    return cuilRegex.test(cuil.trim()) &&
           dateRegex.test(dischargeDate.trim()) &&
           amountRegex.test(amount.trim()) &&
           state.trim() !== '';
  }

const pathFileCSV = path.join(__dirname, inputFile);

fs.readFile(pathFileCSV, 'utf8', (error, data) => {
  if (error) {
    console.error('Error reading input file:', error);
    return;
  }

  const lines = data.split('\n');
  const filteredAndTransformedData = lines
    .slice(1) // Processes from the first element of the vector to the end. Avoid the header
    .filter(line => { //Input format control
        const [cuil, dischargeDate, amount, state] = line.split(';');
        const isValid = validateEntry(cuil, dischargeDate, amount, state);
        if (!isValid) {
          console.error('Badly formatted record:', line);
        }
        return isValid; // If isValid is false, do not include the record in the new output vector
    })
    .filter(line => {
      const [cuil, dischargeDate, amount, state] = line.split(';');
      return state && state.trim() === 'BAD DEBT';
    })
    .map(line => {
      const [cuil, dischargeDate, amount] = line.split(';');
      const dni = cuil.replace(/-/g, '').slice(2, 10); //  "/-/g" : Globally identifies (g) all scripts in the string
                                                       // slice: substring
      const transformedDate = dischargeDate.replace(dateRegex, '$3/$2/$1');
      // replace takes as input the dateRegex regular expression to take the capture groups of the original string, 
      //    represented by $1: Year, #2: Month, #3: Day, from which it creates the output format using the expression: 
      //    "' $3/$2/$1'".

      const transformedAmount = amount
        .replace(/,/g, '#') // Replace commas with a temporary character
        .replace(/\./g, ',') // Replace periods with commas
        .replace(/#/g, '.'); // Reemplazar el carácter temporal por puntos      
      
        return `${dni};${transformedDate};${transformedAmount}`;
    });

  // all elements of the combined array are concatenated into a single text string using the \n separator
  const outputData = ['DNI;DATE;AMOUNT', ...filteredAndTransformedData].join('\n');

  fs.writeFile(outputFile, outputData, 'utf8', err => {
    if (err) {
      console.error('Error writing to output file:', err);
      return;
    }
    console.log('Successfully generated output file:', outputFile);
  });
});
