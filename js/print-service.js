
let S3 = require('s3-browser-direct-upload');

let s3client = new S3({
  accessKeyId: 'accessKeyId', // required
  secretAccessKey: 'secretAccessKey', // required
  region: 'eu-central-1' // required
});

export function uploadImage (base64Data, callback) {
  let data = base64Data.replace(/^data:image\/\w+;base64,/, '');
  let id = getID();

  let options = {
    data,
    key: `${id}.jpg`,
    bucket: 'bucketName'
  };

  s3client.upload(options, (err, url) => {
    if (err) {
      callback(err, null);
      return;
    }

    callback(null, { id, url });
  });
}

let chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
function getID ({ segments = 4, segmentLength = 5 } = {}) {
  let id = '';
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    id += '_';
  }

  return id;
}
