const fs = require('fs');
const path = require('path');

function replaceWebhooks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace double quotes
  content = content.replace(/"https:\/\/vmi3345591\.contaboserver\.net\/webhook\/([^"]+)"/g, '`${import.meta.env.VITE_WEBHOOK_BASE_URL}/$1`');
  
  // Replace single quotes
  content = content.replace(/'https:\/\/vmi3345591\.contaboserver\.net\/webhook\/([^']+)'/g, '`${import.meta.env.VITE_WEBHOOK_BASE_URL}/$1`');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

const files = [
  path.join(__dirname, 'src', 'components', 'VentasDashboard.tsx'),
  path.join(__dirname, 'src', 'components', 'ContactCenterDashboard.tsx'),
  path.join(__dirname, 'src', 'routes', 'mi-cuenta.tsx')
];

files.forEach(replaceWebhooks);
