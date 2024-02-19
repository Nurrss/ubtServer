const isEmptyObject = obj => {
  return obj.constructor === Object && Object.keys(obj).length === 0;
};

module.exports = {
  isEmptyObject,
};
