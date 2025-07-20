import fs from 'fs';
import path from 'path';

const archivos = ['server.js', 'nodeServer.js', 'database.js'];
const cwd = process.cwd();

const replacements = [
  { find: /const fs = require\('fs'\);?/g, replace: "import fs from 'fs';" },
  { find: /const https = require\('https'\);?/g, replace: "import https from 'https';" },
  { find: /const express = require\('express'\);?/g, replace: "import express from 'express';" },
  { find: /const path = require\('path'\);?/g, replace: "import path from 'path';" },
  { find: /const { (.+) } = require\('child_process'\);?/g, replace: "import { $1 } from 'child_process';" },
  { find: /const { (.+) } = require\('(.+)'\);?/g, replace: "import { $1 } from '$2';" },
  { find: /const (\w+) = require\('(.+)'\);?/g, replace: "import $1 from '$2';" },
  { find: /module\.exports\s*=\s*{([^}]+)}/g, replace: "export { $1 }" },
  { find: /module\.exports\s*=\s*(\w+);/g, replace: "export default $1;" },
];

for (const archivo of archivos) {
  const filePath = path.join(cwd, archivo);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const { find, replace } of replacements) {
      content = content.replace(find, replace);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(\`✅ \${archivo} convertido a ES Modules\`);
  } else {
    console.warn(\`⚠️  Archivo no encontrado: \${archivo}\`);
  }
}
