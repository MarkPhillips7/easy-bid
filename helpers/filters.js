Filters.unitsFilter = (input, unitsText) => {
  if (unitsText === '$') {
    let inputAsDecimal;
    if (typeof input === 'number') {
      inputAsDecimal = input.toFixed(2);
    } else if (typeof input === 'string') {
      inputAsDecimal = input.length > 0 ? Number(input).toFixed(2) : '0.00';
    }
    return `$${inputAsDecimal}`;
  } else if (unitsText) {
    return input + ' ' + unitsText;
  } else {
    return input;
  }
};

// angular filters module in client/filters.js
