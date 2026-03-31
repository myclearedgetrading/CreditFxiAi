import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'storage.rules',
];

const missing = requiredFiles.filter((f) => !fs.existsSync(path.join(root, f)));
if (missing.length) {
  console.error(`Missing required Firebase files: ${missing.join(', ')}`);
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'), 'utf8'));
if (!firebaseConfig.firestore?.rules || !firebaseConfig.firestore?.indexes) {
  console.error('firebase.json must include firestore.rules and firestore.indexes config.');
  process.exit(1);
}
if (!firebaseConfig.storage?.rules) {
  console.error('firebase.json must include storage.rules config.');
  process.exit(1);
}

const indexesConfig = JSON.parse(fs.readFileSync(path.join(root, 'firestore.indexes.json'), 'utf8'));
const indexCount = Array.isArray(indexesConfig.indexes) ? indexesConfig.indexes.length : 0;

if (indexCount === 0) {
  console.warn('Warning: firestore.indexes.json has zero indexes.');
} else {
  console.log(`OK: firestore.indexes.json contains ${indexCount} index definition(s).`);
}

console.log('Firebase deploy readiness checks passed.');
