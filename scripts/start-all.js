const { concurrently } = require('concurrently');

concurrently([
  { command: 'nest start product-service --watch', name: 'PRODUCT', prefixColor: 'blue' },
  { command: 'nest start user-service --watch', name: 'USER', prefixColor: 'magenta' },
  { command: 'nest start cart-service --watch', name: 'CART', prefixColor: 'green' },
]);