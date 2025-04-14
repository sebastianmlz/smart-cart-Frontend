// set-env.js
const fs = require('fs');

// Rutas a los archivos de entorno
const devTarget = './src/environments/environment.ts';
const prodTarget = './src/environments/environment.prod.ts';

// Variables que vienen desde Railway o desde .env local
const apiUrl = process.env.API_URL || 'http://localhost:3000/auth';
const apiURLP = process.env.API_URLP || 'http://localhost:3000/api';

// Contenido para entorno de desarrollo (dev)
const devFile = `
export const environment = {
    production: false,
    apiUrl: '${apiUrl}',
    apiURLP: '${apiURLP}'
};
`;

// Contenido para entorno de producción (prod)
const prodFile = `
export const environment = {
    production: true,
    apiUrl: '${apiUrl}'
};
`;

// Escritura de archivos
fs.writeFileSync(devTarget, devFile);
fs.writeFileSync(prodTarget, prodFile);

console.log("✅ Archivos de entorno generados correctamente:");
console.log("- environment.ts");
console.log("- environment.prod.ts");
console.log("📌 apiUrl:", apiUrl);
console.log("📌 apiURLP:", apiURLP);
