
let fs = require('fs');
let execSync = require('child_process').execSync;
let dataUtil = require('./js/data-util');

const typeMap = {
  friends: 'body',
  domestic: 'room'
};
const makeThumbnails = true;

let seriesPaths = fs.readdirSync('models').filter(dirFilter);
let data = seriesPaths.map(seriesPath => {
  let name = dataUtil.toName(seriesPath);
  let fullSeriesPath = `models/${seriesPath}`;
  let models = fs.readdirSync(fullSeriesPath).filter(dirFilter);
  return {
    name,
    path: seriesPath,
    photos: models.map(modelPath => {
      let fullModelPath = `${fullSeriesPath}/${modelPath}`;
      if (makeThumbnails) {
        makeThumbnail(fullModelPath);
      }

      let type = typeMap[modelPath] || 'object';

      let upsideDown = !isMadeByMeshlab(fullModelPath);

      return {
        name: dataUtil.toName(modelPath),
        path: modelPath,
        seriesPath: seriesPath,
        upsideDown,
        type
      };
    })
  };
});

let json = JSON.stringify(data);
fs.writeFileSync('js/data.json', json);

function makeThumbnail (modelPath) {
  let texturePath = `${modelPath}/Model.jpg`;
  let command = `convert ${texturePath} -resize 256x256 ${modelPath}/Thumbnail.jpg`;
  execSync(command);
}

function isMadeByMeshlab (modelPath) {
  let mtlPath = `${modelPath}/Model.mtl`;
  let text = fs.readFileSync(mtlPath);
  return text.indexOf('Meshlab') >= 0;
}

function dirFilter (d) {
  return d !== '.DS_Store';
}
