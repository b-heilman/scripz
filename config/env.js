function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

var fs = require('fs'),
	name = JSON.parse(fs.readFileSync('./package.json')).name,
	config = {
		name: name.toLowerCase(),
		library: capitalizeFirstLetter(name),
		distDir: 'dist/',
		demoDir: 'demo/',
		configDir: 'config/',
		jsSrc: ['src/*.js','src/**/*.js'],
		externals: {
			"es6-promise": "ES6Promise"
		}
	};

config.karmaConfig = config.configDir+'karma.conf.js';
config.demoConfig = config.configDir+'demo.js';
config.libraryConfig = config.configDir+'library.js';
config.jsDemo = [config.demoConfig].concat(config.jsSrc);

module.exports = config;