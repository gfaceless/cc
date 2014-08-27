var SpreadsheetWriter = require('pyspreadsheet').SpreadsheetWriter;
var writer = new SpreadsheetWriter('/output.xls');

// write a string at cell A1
writer.write(0, 0, 'жпнд');

writer.save(function (err) {
  if (err) throw err;
  console.log('file saved!');
});