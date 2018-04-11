/**
* @preserve
* https://github.com/GregBee2/xassist-ajax.git Version 0.0.2.
*  Copyright 2018 Gregory Beirens.
*  Created on Wed, 11 Apr 2018 11:13:23 GMT.
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.xa = global.xa || {})));
}(this, (function (exports) { 'use strict';

var _xhrObject=(function () { // Factory method.
		var methods = [
			function () {
				return new XMLHttpRequest();
			},
			function () {
				return new window.ActiveXObject('Msxml2.XMLHTTP');
			},
			function () {
				return new window.ActiveXObject('Microsoft.XMLHTTP');
			}
		];
		for (var i = 0, len = methods.length; i < len; i++) {
			try {
				methods[i]();
			} catch (e) {
				continue;
			}
			// If we reach this point, method[i] worked.
			// Memoize the method. by storing it in the variable
			return methods[i];
		}
		// If we reach this point, none of the methods worked.
		throw new Error('AjaxHandler: Could not create an XHR object.');
	})(),
	_statusCodeRanges=function(statusCode){
		var ranges=["1xx Informational responses","2xx Success","3xx Redirection","4xx Client errors","5xx Server errors"],
			unknown="?xx Unknown HTTPCode-range",
			range=Math.floor(statusCode/100)-1;
		if(range>=0&&range<ranges.length){
			return ranges[range];
		}
		return unknown+" ("+statusCode+")";
	},
	_statusCodesDetails={"200":"ok","304":"Not Modified (does NOT count as success!)","400":"bad request","401":"authentication needed",
		"403":"unauthorized (no auth needed)","404":"not found","414":"uri to long","429":"too many requests",
		"500":"internal server error","503":"service unavailable (try again)"};
	//not used may be usefull?
	function getAbsoluteURL(url,base_url) {
		var doc      = document
			, old_base = doc.getElementsByTagName('base')[0]
			, old_href = old_base && old_base.href
			, doc_head = doc.head || doc.getElementsByTagName('head')[0]
			, our_base = old_base || doc_head.appendChild(doc.createElement('base'))
			, resolver = doc.createElement('a')
			, resolved_url;
		our_base.href = base_url || '';
		resolver.href = url;
		resolved_url  = resolver.href; // browser magic at work here

		if (old_base) old_base.href = old_href;
		else doc_head.removeChild(our_base);
		return resolved_url;
	}
	function xassistAjax(url,opts){
		var _handler=new AJAXHandler(url,opts);
		var me;
		me={
			on:function(event,cb,thisArg){
				if(event==="success"){
					_handler.addSuccessHandler(cb,thisArg);
				}
				else if(event==="fail"){
					_handler.addFailHandler(cb,thisArg);
				}
				else if(event==="progress"){
					_handler.addProgressHandler(cb,thisArg);
				}
				else if(event==="loadEnd"){
					_handler.addAlwaysHandler(cb,thisArg);
				}
				else{
					throw new ReferenceError("event was not registerd")
				}
				return me;
			},
			success:function(cb,thisArg){
				_handler.addSuccessHandler(cb,thisArg);
				return me;
			},
			fail:function(cb,thisArg){
				_handler.addFailHandler(cb,thisArg);
				return me;
			},
			always:function(cb,thisArg){
				_handler.addAlwaysHandler(cb,thisArg);
				return me;
			},
			onProgress:function(cb,thisArg){
				_handler.addProgressHandler(cb,thisArg);
				return me;
			},
			getResponse:function(){return _handler.xhr.response;},
			getHTTPCode:function(detail){
				//detail is default true
				detail=(typeof detail==="undefined")||!!detail;
				if(detail){
					return _handler.detailedStatus();
				}
				//else
				return _handler.xhr.status;
			},
			_getHandler:function(){ return _handler},
			_getXHRObject:function(){ return _handler.xhr}
		};
		return me;
	}
	
	function AJAXHandler(url,opts){
		var _responseTypes=["text"/*,"arraybuffer","blob","document"*/,"json"];
		this.callbacks={
			success:[],
			fail:[],
			always:[],
			progress:[]
		};
		if(typeof opts==="undefined"){
			opts={};
		}
		this.url=url;
		this.method= ((opts.method&&opts.method==="POST")?"POST":"GET");
		
		this.done=false;
		this.success=false;
		this.xhr=_xhrObject();
		//this does not work in IE11 xhr.responseType does nothing, but chrome works fine
		this.responseType=_responseTypes[_responseTypes.indexOf(opts.type)]||_responseTypes[0];
		this.postVars=opts.data||null;
		
		this.init();
	}
	AJAXHandler.prototype.addSuccessHandler=function(callback,thisArg){
		if(!thisArg){
			thisArg=this.xhr;
		}
		//check if document state is complete
		if (this.done&&this.success){
			
			callback.apply(thisArg,this.eventDetails);
		}
		else{
			//add to executionList;
			this.callbacks.success.push([callback,thisArg]);
			
		}
	};
	AJAXHandler.prototype.addFailHandler=function(callback,thisArg){
		if(!thisArg){
			thisArg=this.xhr;
		}
		//check if document state is complete
		if (this.done&&!this.success){
			
			callback.apply(thisArg,this.eventDetails);
		}
		else{
			//add to executionList;
			this.callbacks.fail.push([callback,thisArg]);
			
		}
	};
	AJAXHandler.prototype.addAlwaysHandler=function(callback,thisArg){
		if(!thisArg){
			thisArg=this.xhr;
		}
		//check if document state is complete
		if (this.done){
			
			callback.apply(thisArg,this.eventDetails);
		}
		else{
			//add to executionList;
			this.callbacks.always.push([callback,thisArg]);
			
		}
	};
	AJAXHandler.prototype.addProgressHandler=function(callback,thisArg){
		if(!thisArg){
			thisArg=this.xhr;
		}
		//check if document state is complete
		if (this.done){
			
			//callback.apply(thisArg,this.eventDetails);
		}
		else{
			//add to executionList;
			this.callbacks.progress.push([callback,thisArg]);
			
		}
	};
	AJAXHandler.prototype.removeHandlers=function(){
		this.callbacks={
			success:[],
			fail:[],
			always:[],
			progress:[]
		};
	};
	AJAXHandler.prototype.detailedStatus=function(){
		var result=this.xhr.status+" "+_statusCodeRanges(this.xhr.status);
		if(_statusCodesDetails.hasOwnProperty(this.xhr.status)){
			result+="-"+_statusCodesDetails[this.xhr.status];
		}
		return result;
	};
	AJAXHandler.prototype.init=function () {
		this.xhr.addEventListener("progress", this.updateProgress.bind(this));
		this.xhr.open(this.method, this.url, true); //true for async
		/*TO DO does not work for IE better testing needed for chrome eg json with pure html page=> load error?*/
		//this.xhr.responseType =this.responseType;
		/*
		Setting the value of responseType to "document" is ignored if done in a  Worker environment. 
		When setting responseType to a particular value, the author should make sure that the server is actually 
		sending a response compatible to that format. If the server returns data that is not compatible to the responseType that was set, 
		the value of response will be null. Also, setting responseType for synchronous requests will throw an InvalidAccessError exception.
		ref https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType */
		this.xhr.onreadystatechange = this.readyStateEvent.bind(this);
		this.xhr.send(this.postVars);
	};
	
	AJAXHandler.prototype.updateProgress=function(event){
		this.executeHandlers(['progress'],[event]);
	};
	AJAXHandler.prototype.getAbsoluteURL=function(){
		return getAbsoluteURL(this.url);
	};
	AJAXHandler.prototype.readyStateEvent=function(){
		var contentType;
		if (this.xhr.readyState === 2){
			//setContentType
			contentType=this.xhr.getResponseHeader("content-type").split('/');
			this.contenType={
				type:contentType[0],
				subType:contentType[1]
			};
			return;
		}
		else if (this.xhr.readyState !== 4){
			return;
		}
		//else equals 4
		this.eventDetails=[this.xhr.response,this.detailedStatus(),this.xhr,this];
		this.done=true;
		
		if(this.xhr.status >= 200 && this.xhr.status<300){
			this.success=true;
			this.eventDetails[0]=this.parseType(this.eventDetails[0]);
		}
		if(this.success){
			//success
			this.executeHandlers(['success','always'],this.eventDetails);
		}
		else{
			//fail
			this.executeHandlers(['fail','always'],this.eventDetails);
		}
		this.removeHandlers();
	};
	AJAXHandler.prototype.parseType=function(response){
		//this function may adapt the success outcome
		var result;
		if (this.responseType==="json"){
			try{
				result=JSON.parse(response);
			}
			catch(err){
				//parsing was not possible
				this.success=false;
				result="Problem parsing JSON: partial response: "+response.substring(1, 157)+"...";
			}
		}
		else{
			result=response;
		}
		return result;
	};
	AJAXHandler.prototype.executeHandlers=function (types,event) {
		var i,l;
		for(i=0, l=types.length;i<l;i++){
			if(this.callbacks.hasOwnProperty(types[i])){
				this.callbacks[types[i]].forEach(function(cb){
					cb[0].apply(cb[1],event);
				});
			}
		}
	};
/*test
after test no memoryleaks found onreadystatechange is garbage collected!

var a=$b.ajax("nieuwsblad.be")
	.success(function(){
		console.log('success');
		console.log(arguments)
		console.log(this);
	})
	.fail(function(){
		console.log('fail');
		console.log(arguments)
		console.log(this);
	})
	.always(function(){
		console.log('always');
		console.log(arguments)
		console.log(this);
	});
var b=setTimeout(function(){
    a.success(function(){
			console.log('success2');
			console.log(arguments)
			console.log(this);
		})
		.fail(function(){
			console.log('fail2');
			console.log(arguments)
			console.log(this);
		})
		.always(function(){
			console.log('always2');
			console.log(arguments)
			console.log(this);
		});
}, 2000);

*/

exports.ajax = xassistAjax;

Object.defineProperty(exports, '__esModule', { value: true });

})));
