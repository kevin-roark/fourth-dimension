
let S3 = require('s3-browser-direct-upload');
import { s3 as s3Credentials } from './credentials';
let bucket = 'kevin-my-world';

let s3client = new S3({
  accessKeyId: s3Credentials.accessKeyId,
  secretAccessKey: s3Credentials.secretAccessKey,
  region: s3Credentials.region
});

export function uploadImage (name, base64Data, callback) {
  if (s3Credentials.mock) {
    setTimeout(() => {
      callback(null, { id: 'lol' });
    }, 2000);
    return;
  }

  let data = base64ToByteArray(base64Data.replace(/^data:image\/\w+;base64,/, ''));
  let id = getID(name);

  let options = { bucket, data, key: `${id}.png` };
  s3client.upload(options, (err, url) => {
    if (err) {
      callback(err, null);
      return;
    }

    callback(null, { id, url });
  });
}

let chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
function getID (name, suffixLength = 8) {
  let date = new Date();
  let datestr = `${date.getMonth() + 1}-${date.getDate()}-${date.getYear() % 100}`;

  let suffix = '';
  for (let i = 0; i < suffixLength; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  let id = `${name}_${datestr}_${suffix}`;
  return id;
}

function base64ToByteArray (base64Data) {
  let byteCharacters = window.atob(base64Data);

  let byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  let byteArray = new Uint8Array(byteNumbers);
  return byteArray;
}
