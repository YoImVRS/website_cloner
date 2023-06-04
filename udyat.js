const axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = require('url');
const figlet = require('figlet');
const readline = require('readline');

axios.defaults.maxRedirects = 999;

process.stdout.write('\x1b]2;UdyatCloner v1 - github.com/ottersek\x1b\x5c');
process.stdout.write('\x1Bc');

console.clear();

const logo = figlet.textSync('UDYAT', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default'
});

const centerText = (text) => {
  const terminalWidth = process.stdout.columns;
  const centeredText = text.padStart((terminalWidth + text.length) / 2);
  console.log(centeredText);
};

console.log('\n');
centerText('v1 - made by github.com/ottersek');
console.log(logo);
console.log('\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Website URL: ', (inputUrl) => {
  rl.question('Save All Files (Y/N): ', (answer) => {
    const includeAllFiles = answer.toLowerCase() === 'y';

    rl.question('Path to Save: ', (destinationPath) => {
      rl.close();
      console.log('\n');

      const parsedUrl = url.parse(inputUrl);
      const domainName = parsedUrl.hostname.replace('www.', '');

      async function cloneWebsite(url, destinationPath, includeAllFiles) {
        try {
          const response = await axios.get(url, { responseType: 'arraybuffer' });

          const domainPath = path.join(destinationPath, domainName);
          if (!fs.existsSync(domainPath)) {
            fs.mkdirSync(domainPath, { recursive: true });
          }

          const fileName = 'index.html';
          const filePath = path.join(domainPath, fileName);
          fs.writeFileSync(filePath, response.data);

          console.log('[UdyatCloner] Cloning website!');
          console.log('[UdyatCloner] File saved at:', filePath);

          if (includeAllFiles) {
            const pageContent = response.data.toString();
            const fileRegex = /(?:href|src)=["']([^"']+)/g;
            let match;
            while ((match = fileRegex.exec(pageContent))) {
              const fileUrl = match[1];
              const absoluteUrl = new URL(fileUrl, url).href;
              const fileData = await axios.get(absoluteUrl, { responseType: 'arraybuffer' });
              const fileExtension = path.extname(fileUrl);
              const fileBaseName = path.basename(fileUrl);
              const fileDestinationPath = path.join(domainPath, fileBaseName);
              fs.writeFileSync(fileDestinationPath, fileData.data, { encoding: 'binary' });
              console.log('[UdyatCloner] File saved at:', fileDestinationPath);
            }
          }

          console.log('\n');
          centerText('Cloned Successfully!');
          console.log('\n');
        } catch (error) {
          console.error('[UdyatCloner] An error has occurred.');
        }
      }

      cloneWebsite(inputUrl, destinationPath, includeAllFiles);
    });
  });
});
