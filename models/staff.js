var fs = require('fs');
var path = require('path');

var staff = {};

staff.getInfo = function(src) {
	var staffInfo = [];
	var files = fs.readdirSync(src);
	var len = files.length;
	var i = 0;
	var file = null;
	for (; i<len; i++) {
		file = src + '/'+ files[i];
		staffInfo.push(path.basename(file))
		// 重命名文件名		
		// var newpath = src + '/' + path.basename(file).replace('(', '').replace(')', '');
		// fs.rename(file, newpath);
	}
	return staffInfo;
}

module.exports = staff;
