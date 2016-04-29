var config = {
	distDir: 'dist/',
	demoDir: 'demo/',
	configDir: 'config/',
	jsSrc: ['src/*.js','src/**/*.js']
};

config.demoConfig = config.configDir+'demo.js';
config.libraryConfig = config.configDir+'library.js';
config.jsDemo = [config.demoConfig].concat(config.jsSrc);

module.exports = config;