const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'app', 'core', 'components', 'modals');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('-modal.css')) {
      updateCssFile(filePath, file);
    }
  });
}

function updateCssFile(filePath, file) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Modal Overlay
  content = content.replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.5\);/g, 'background: rgba(0, 0, 0, 0.4);');
  
  // 2. Modal Container
  content = content.replace(/border-radius:\s*(8px|12px);/g, 'border-radius: 16px;');
  // The first time it might match something else, let's be more specific.
  
  // Actually, rewriting the whole blocks is better.
  content = content.replace(/\.modal-header\s*\{[^}]+\}/g, `.modal-header {
  background-color: white;
  padding: 24px 24px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}`);

  content = content.replace(/\.modal-header h2[\s\S]*?\}/g, `.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #111;
  display: flex;
  align-items: center;
  gap: 8px;
}`);

  content = content.replace(/\.btn-close\s*\{[^}]+\}/g, `.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #8F8071;
  cursor: pointer;
}`);

  content = content.replace(/\.form-group label\s*\{[^}]+\}/g, `.form-group label {
  font-size: 11px;
  font-weight: 800;
  color: #8F8071;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}`);

  // Add hide icon in label rule if it doesn't exist
  if (!content.includes('.form-group label i')) {
    content = content.replace(/\.form-group label\s*\{[^}]+\}/g, match => match + '\n\n.form-group label i {\n  display: none;\n}');
  }

  content = content.replace(/\.form-group input,\s*\.form-group select,\s*\.form-group textarea\s*\{[^}]+\}/g, `.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e8e1d9;
  border-radius: 10px;
  font-size: 15px;
  color: #5C5146;
  box-sizing: border-box;
  background: #faf7f2;
  transition: border-color 0.2s;
  font-family: inherit;
}`);

  content = content.replace(/\.form-group input:focus,\s*\.form-group select:focus,\s*\.form-group textarea:focus\s*\{[^}]+\}/g, `.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #FF5E00;
  outline: none;
}`);

  content = content.replace(/\.modal-footer\s*\{[^}]+\}/g, `.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 16px;
}`);

  content = content.replace(/\.btn-cancel\s*\{[^}]+\}/g, `.btn-cancel {
  flex: 1;
  background: white;
  border: 2px solid #e8e1d9;
  color: #8F8071;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}`);

  content = content.replace(/\.btn-save\s*\{[^}]+\}/g, `.btn-save {
  flex: 1;
  background: #FF5E00;
  border: none;
  color: white;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 94, 0, 0.2);
}`);

  content = content.replace(/\.btn-cancel:hover\s*\{[^}]+\}/g, `.btn-cancel:hover { background: #fdfbf9; }`);
  content = content.replace(/\.btn-save:hover\s*\{[^}]+\}/g, `.btn-save:hover { background: #e65500; }`);

  // Handle remaining teal accents
  content = content.replace(/\.bg-light-grey\s*\{[^}]+\}/g, `.bg-light-grey {
  background-color: #f0ebe4 !important;
  color: #8F8071 !important;
}`);

  if (content.includes('.btn-get-price')) {
    content = content.replace(/\.btn-get-price\s*\{[^}]+\}/g, `.btn-get-price {
  background: #8F8071;
  border: none;
  color: white;
  border-radius: 10px;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}`);
    content = content.replace(/\.btn-get-price:hover\s*\{[^}]+\}/g, `.btn-get-price:hover { background: #7a6d60; }`);
  }
  
  if (content.includes('.btn-add-teal')) {
    content = content.replace(/\.btn-add-teal\s*\{[^}]+\}/g, `.btn-add-teal {
  background: white;
  border: 2px solid #FF5E00;
  color: #FF5E00;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}`);
    content = content.replace(/\.btn-add-teal:hover\s*\{[^}]+\}/g, `.btn-add-teal:hover { background: #fff5f0; }`);
  }

  // Handle specific flight title
  content = content.replace(/\.modal-title\s*\{[^}]+\}/g, `.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #111;
  display: flex;
  align-items: center;
  gap: 8px;
}`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}

processDirectory(directoryPath);
