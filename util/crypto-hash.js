const crypto = require('crypto');

const cryptoHash = (...inputs) => {
  const hash = crypto.createHash('sha256');

  hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

  //means show result of hash in hex
  return hash.digest('hex');
};

module.exports = cryptoHash;