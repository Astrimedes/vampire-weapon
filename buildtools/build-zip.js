/* eslint-disable no-undef */
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

// const currPath = path.join(path.resolve('.'), 'buildtools');

const inputPath = path.join(path.resolve('.'), 'dist');
const outputPath = path.join(path.resolve('.'), 'build', 'build.zip');
console.log(inputPath, outputPath);

if (!fs.existsSync(inputPath)) {
  throw new Error('Could not access build file folder!');
}

if (fs.existsSync(outputPath)) {
  try {
    fs.unlinkSync(outputPath);
    console.log('successfully deleted: ', outputPath);
  } catch (err) {
    console.error('Error while trying to delete file: ', outputPath);
    throw err;
  }
}

// create a file to stream archive data to.
var output = fs.createWriteStream(outputPath);
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

// pipe archive data to the file
archive.pipe(output);

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// add files from directory and put in root of archive
archive.directory(inputPath, false);

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();
