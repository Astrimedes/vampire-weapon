const Shell = require('node-powershell');
const path = require('path');

const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

const zipFilePath = path.join(path.resolve('.'), 'build', 'build.zip');
const uploadPath = 'secondplacegames/vampire-weapon:html5';

console.log(zipFilePath, uploadPath);

ps.addCommand('echo node-powershell');
ps.addCommand(`butler -i ./.config/itch/spgames_creds push '${zipFilePath}' '${uploadPath}'`);


ps.invoke()
  .then(output => {
    console.log(output);
  })
  .catch(err => {
    console.log(err);
  })
  .finally(() => ps.dispose());
