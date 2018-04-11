var csv2readme = require('csv2readme');

var options={
	input:{
		base:"../../helpData/csv/base.csv",
		functionParam:"../../helpData/csv/functionParameters.csv",
		classDef:"../../helpData/csv/classDefinition.csv"
	},
	moduleName:"xassist-ajax",
	globalTOC:false,
	header:{
		title:"@xassist/xassist-ajax",
		explanation:"Generic ajax handler. With different events (ready, fail on progress)"
	},
	headerFiles:["../../helpData/markdown/installationModule.md"],
	includeDependencies:true,
	includeLicense:true,
	footerFiles:[],
	subTitle:"API",
	output:{
		file:"README.md"
	},
	baseLevel:3,
	headerTemplates:{
		moduleName:"xassist-ajax",
		moduleUrl:"https://github.com/GregBee2/xassist-ajax.git",
		libraryName:"@xassist",
		libraryUrl:"https://github.com/GregBee2/xassist",
		moduleTest:"ajax()"
	},
	footerTemplates:{
	}
};
csv2readme.init(options);