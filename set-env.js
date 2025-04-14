// set-env.js
const fs = require('fs');

const devTarget = './src/environments/environment.ts';
const prodTarget = './src/environments/environment.prod.ts';

// Valor recibido desde Railway o entorno local (.env)
const apiUrl = process.env.API_URL || 'http://localhost:3000';

const devFile = `
export const environment = {
  production: false,
  apiUrl: '${apiUrl}'
};
`;

const prodFile = `
export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(devTarget, devFile);
fs.writeFileSync(prodTarget, prodFile);

console.log('✅ Archivos de entorno generados correctamente:');
console.log('- environment.ts');
console.log('- environment.prod.ts');
console.log(`→ apiUrl: ${apiUrl}`);
