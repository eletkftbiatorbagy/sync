var AJAX_URL = "http://fajlbank.hu/";


var  onDeviceReady = function() {
        //  itt kezdődik a buli ==============================================================================================================================================
     
     	Start();
     	
        
    } 
    
var callback;    
    
function Start()
{
	callback = function(response) { Login_adatok('AJAX_LOGIN',response); }; 
	ajax_hivas(AJAX_URL +'get_server_dir.php','', 'callback' ,'AJAX_LOGIN',0);
}

function Login_adatok(DOM,response)
{
	var obj = eval(response);
	for(var name in obj) 
	{
    	console.log(name+" = "+ JSON.parse(obj[name])[0]);
	}
	
}





function network_status() {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = '???';
            states[Connection.ETHERNET] = 'Vezetékes';
            states[Connection.WIFI]     = 'WiFi';
            states[Connection.CELL_2G]  = 'Mobil';
            states[Connection.CELL_3G]  = 'Mobil';
            states[Connection.CELL_4G]  = 'Mobil';
            states[Connection.CELL]     = 'Mobil';
            states[Connection.NONE]     = 'nincs';
            return states[networkState];
} 