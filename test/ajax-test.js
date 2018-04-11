var definition = require("../package.json");
var main =require("../"+definition.main);
var tape=require("tape");

tape("ajax().success()(): test_0", function(test){
	test.ok(true,
		"ajax().success()() WORKS");
	test.end();
});
tape("ajax().fail()(): test_1", function(test){
	test.ok(true,
		"ajax().fail()() WORKS");
	test.end();
});
tape("ajax().always()(): test_2", function(test){
	test.ok(true,
		"ajax().always()() WORKS");
	test.end();
});
tape("ajax().onProgress()(): test_3", function(test){
	test.ok(true,
		"ajax().onProgress()() WORKS");
	test.end();
});
tape("ajax().getResponse()(): test_4", function(test){
	test.ok(true,
		"ajax().getResponse()() WORKS");
	test.end();
});
tape("ajax().getHTTPCode()(): test_5", function(test){
	test.ok(true,
		"ajax().getHTTPCode()() WORKS");
	test.end();
});