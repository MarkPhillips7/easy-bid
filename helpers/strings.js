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
      return item.length ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : '';
    }
  }).join('');
}

// Return text camelCased with prepended '_' if the first character is a digit
const toVariableName = (text) => {
  const variableName = camelCase(text.replace('#', ' num '));
  if (variableName && variableName.length && charIsDigit(variableName[0])) {
    return `_${variableName}`;
  }
  return variableName;
};

// with inputs like ['car key', 'House Key'] expect return like 'carkey|HouseKey'
const squish = (...inputs) => {
  return _.reduce(inputs, (memo, input) => {
    return `${memo}${memo.length > 0 ? '|' : ''}${input.replace(/\s/g, '')}`;
  }, '');
}

StringUtils = {
  camelCase,
  charIsDigit,
  squish,
  toVariableName,
}
