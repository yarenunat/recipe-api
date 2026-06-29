const fs = require('fs');
const cp = require('child_process');

const envContent = fs.readFileSync('.env', 'utf-8');
const lines = envContent.split('\n').filter(l => l.trim() && !l.startsWith('#'));

for (const line of lines) {
  const parts = line.split('=');
  const key = parts[0];
  if (!key) continue;
  
  let val = parts.slice(1).join('=');
  val = val.replace(/^"|"$/g, '').trim();
  
  console.log(`Adding ${key}...`);
  try {
    cp.execSync(`npx vercel env add ${key} production --value "${val}" --force`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to add ${key}`);
  }
}
