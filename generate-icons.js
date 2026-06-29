const fs = require('fs');
const Jimp = require('jimp');

async function resizeIcons() {
  try {
    const image = await Jimp.read('public/logo.png');
    
    // Create 192x192 icon
    image.resize(192, 192)
         .write('public/icon-192x192.png');
         
    // Create 512x512 icon
    const image512 = await Jimp.read('public/logo.png');
    image512.resize(512, 512)
            .write('public/icon-512x512.png');
            
    // Create apple-touch-icon
    const appleIcon = await Jimp.read('public/logo.png');
    appleIcon.resize(180, 180)
             .write('public/apple-icon.png');
             
    // Create favicon (32x32)
    const favicon = await Jimp.read('public/logo.png');
    favicon.resize(32, 32)
           .write('public/favicon.ico');

    console.log('Successfully generated all icons from logo.png!');
  } catch (error) {
    console.error('Error resizing icons:', error);
  }
}

resizeIcons();
