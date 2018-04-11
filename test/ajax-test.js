var jsdom = require("jsdom");
var URL="http://localhost/"
var doc=new jsdom.JSDOM("<!DOCTYPE html><h1 id='one'></h1>",{
		url: URL,
		referrer: URL,
		 contentType: "text/html",
		userAgent: "node.js",
		includeNodeLocations: true

	}
)
global.window=doc.window;
XMLHttpRequest=doc.window.XMLHttpRequest;
var definition = require("../package.json");
var { ajax } =require("../"+definition.main);
var tape=require("tape");


tape("ajax().success():add successhandler to the asynchronous ajaxCall", function(test){
	var correctResponse=false;
	var correctStatus=false;
	var correctXhr=false;
	var correctMe=false;
	var correctThis=false;
	var newMe={hello:"world"};
	var a=ajax(URL);
	a.success(function(response,status,xhr,me){
		correctResponse=response.slice(0,220).toUpperCase().indexOf('HTML')>0;
		correctStatus=(status.indexOf("200")==0)
		correctXhr=(xhr.status=="200")
		correctMe=(me==a._getHandler())
		
		correctThis=(this===xhr)
	})
	a.success(function(){
		correctThis=correctThis&&(this===newMe)
	},newMe)
	a.success(function(){
		test.ok(correctResponse&&correctStatus&&correctXhr&&correctMe&&correctThis,
			"ajax().success() adds correct successhandler to ajaxcall");
		test.end();
	})
	
});
tape("ajax().fail(): adds correct handler for failed requests", function(test){
	var correctResponse=false;
	var correctStatus=false;
	var correctXhr=false;
	var correctMe=false;
	var correctThis=false;
	var newMe={hello:"world"};
	var a=ajax(URL+"hjh");
	a.fail(function(response,status,xhr,me){
		console.log(status)
		correctResponse=response.slice(0,220).toUpperCase().indexOf('HTML')>0;
		correctStatus=(status.indexOf("404")==0)
		correctXhr=(xhr.status=="404")
		correctMe=(me==a._getHandler())
		
		correctThis=(this===xhr)
	})
	a.fail(function(){
		correctThis=correctThis&&(this===newMe)
	},newMe)
	a.fail(function(){
		test.ok(correctResponse&&correctStatus&&correctXhr&&correctMe&&correctThis,
			"ajax().fail() adds correctfail handler to ajaxcall");
		test.end();
	})
});
tape("ajax().always(): add handler for any outcome", function(test){
	var correctResponse=false;
	var correctStatus=false;
	var correctXhr=false;
	var correctMe=false;
	var correctThis=false;
	var newMe={hello:"world"};
	var a=ajax(URL+"hjh");
	a.always(function(response,status,xhr,me){
		console.log(status)
		correctResponse=response.slice(0,220).toUpperCase().indexOf('HTML')>0;
		correctStatus=(status.indexOf("404")==0)
		correctXhr=(xhr.status=="404")
		correctMe=(me==a._getHandler())
		
		correctThis=(this===xhr)
	})
	a.always(function(){
		correctThis=correctThis&&(this===newMe)
	},newMe)
	a.always(function(){
		test.ok(correctResponse&&correctStatus&&correctXhr&&correctMe&&correctThis,
			"ajax().always() adds correct handler to ajaxcall");
		test.end();
	})
});
tape("ajax().onProgress(): add handler for progress events", function(test){
	var correctProgressEvent=true;
	var correctThis=true;
	var newMe={hello:"world"};
	var a=ajax(URL);
	a.onProgress(function(e){
		correctProgressEvent=correctProgressEvent&&(e.constructor.name=="ProgressEvent");
		correctThis=correctThis&&(this===a._getHandler().xhr)
	})
	a.onProgress(function(e){
		correctProgressEvent=correctProgressEvent&&(e.constructor.name=="ProgressEvent");
		correctThis=correctThis&&(this===newMe)
	},newMe)
	a.always(function(response,status,xhr,me){
		test.ok(correctThis&&correctProgressEvent,
			"ajax().onProgress() gets progress events received");
		test.end();
	})
});
tape("ajax().getResponse(): test_4", function(test){
	var result;
	var a=ajax(URL+"hjh");
	result=a.getResponse()=="";
	a.always(function(response,status,xhr,me){
		test.ok(a.getResponse()==response&&result,
			"ajax().getResponse() gets response received");
		test.end();
	})
});
tape("ajax().getHTTPCode(): test_5", function(test){
	var result;
	var a=ajax(URL+"hjh");
	result=a.getHTTPCode(false)==0;
	a.always(function(response,status,xhr,me){
		
		test.ok(a.getHTTPCode().indexOf("404")==0&&result,
			"ajax().getHTTPCode() gets responcecode received");
		test.end();
	})
});