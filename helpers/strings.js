const charIsDigit = (c) => {
  return !isNaN(parseInt(c, 10));
}

const camelCase = (text) => {
  // only include spaces, characters, and digits prior to splitting
  const textArray = text.replace(/[^a-z0-9 ]/gi,' ').trim().split(' ');
  return _.map(textArray, (item, index) => {
    if (index === 0) {
      return item.toLowerCase();
    }
    else {
      return item.length ? item.charAt(0).toUpperCase() + item.slice(1) : '';
    }
  }).join('');
}

// Return text camelCased with prepended '_' if the first character is a digit
const toVariableName = (text) => {
  const variableName = camelCase(text);
  if (variableName && variableName.length && charIsDigit(variableName[0])) {
    return `_${variableName}`;
  }
  return variableName;
};

StringUtils = {
  camelCase,
  charIsDigit,
  toVariableName,
}
