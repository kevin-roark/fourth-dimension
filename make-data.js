
let fs = require('fs');
let execSync = require('child_process').execSync;
let dataUtil = require('./js/data-util');

const typeMap = {
  friends: 'body',
  domestic: 'room',
};
const makeThumbnails = false;

let seriesPaths = fs.readdirSync('models').filter(dirFilter);
let data = seriesPaths.map(seriesPath => {
  let name = dataUtil.toName(seriesPath);
  let fullSeriesPath = `models/${seriesPath}`;
  let models = fs.readdirSync(fullSeriesPath).filter(dirFilter);
  return {
    name,
    path: seriesPath,
    photos: models.map(modelPath => {
      if (makeThumbnails) {
        makeThumbnail(`${fullSeriesPath}/${modelPath}`);
      }

      let type = typeMap[modelPath] || 'object';
      return {
        name: dataUtil.toName(modelPath),
        path: modelPath,
        type
      };
    })
  };
});

let json = JSON.stringify(data);
fs.writeFileSync('js/data.json', json);

function makeThumbnail(modelPath) {
  let texturePath = `${modelPath}/Model.jpg`;
  let command = `convert ${texturePath} -resize 512x512 ${modelPath}/Thumbnail.jpg`;
  execSync(command);
}

function dirFilter(d) {
  return d !== '.DS_Store';
}
