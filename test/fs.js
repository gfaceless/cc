var fs = require('fs');

var log = fs.createWriteStream('e:/log.txt', {'flags': 'a'});

log.write('hey\n');
log.write('hey\n');

setTimeout(function() {
	log.write('blah');
}, 2000);

