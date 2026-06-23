const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/GROQ_API_KEY="([^"]+)"/);
if (match && match[1]) {
  fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${match[1]}` }
  })
  .then(res => res.json())
  .then(data => {
    console.log(data.data.map(m => m.id).join('\n'));
  });
} else {
  console.log("No key found");
}
