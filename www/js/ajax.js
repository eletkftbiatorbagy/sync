function ajax_hivas(url,params,callback,DOM,DELETE_msec)
{
				if (network_status=='nincs') { return; }
				url =  url + "?random="+Math.random() + params + "&callback="+callback; 
				var script = document.createElement('script');
				script.setAttribute("type","application/javascript");
				script.setAttribute("id",DOM);
				script.setAttribute('src', url);
				document.getElementsByTagName('head')[0].appendChild(script);
				if (DELETE_msec != 0) { setTimeout( function() { FreeCallback(DOM); }  ,DELETE_msec || 1000); } 
}

function FreeCallback(DOM)
{
	var CALLBACK_item = document.getElementById(DOM);
	if (CALLBACK_item) { CALLBACK_item.parentNode.removeChild(CALLBACK_item); }
}


