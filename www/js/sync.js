const RootDirectory = "bmefitness";

var SzinkronStart=false;

function fail(error) {
	console.log("File ERROR : "+error.name+" / " + error.message);
}

function Szinkron()
{
	if (SzinkronStart) { return; }
	SzinkronStart=true;
	callback = function(response) { GetRemoteDirs('AJAX_SZINKRON',response); } ;
	var url = AJAX_URL +'get_server_dir.php';
	ajax_hivas(url,'', 'callback' ,'AJAX_SZINKRON',0); 
}

var LocalFiles;
var RemoteFiles;

function GetRemoteDirs(DOMelement,response)
{
	if (!response) { return; }
	RemoteFiles = eval(response);
	for (x in RemoteFiles)
	{
		RemoteFiles[x] = JSON.parse(RemoteFiles[x]);
	}
	FreeCallback(DOMelement);
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	
	
	if (window.device)				// mobilon fut 
	{
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) { Keres(fs,RootDirectory)} , function hiba1(e){fail(e);} );
	}
	else
	{
		navigator.webkitPersistentStorage.requestQuota( 1024*1024, function(grantedBytes) {gotFS(grantedBytes);}, 
			function hiba2(e){fail(e);}
		);
	}
	
	
	
}

function gotFS(grantedBytes) {  console.log(grantedBytes);
		 							 window.requestFileSystem(PERSISTENT, grantedBytes, function(fs) { Keres(fs,RootDirectory)} , function hiba1(e){fail(e);} );
		 					 }



function Keres(fs, konyvtar)
{
	//fs.root.getDirectory(konyvtar,{ create: true }, null, function hiba0(e){ fail(e); }); 	
	
	// fs.root.getDirectory(konyvtar+"/foglalkozasok",{ create: true }, function(){console.log('Sikeres könyvtár létrehozás!');}, function hiba3(e){fail(e);});
// 	fs.root.getFile(konyvtar+'/foglalkozasok/BODYPUMP.jpg', {create:true}, function(){console.log('Sikeres fájl létrehozás!');}, function hiba4(e){fail(e);});
// 	fs.root.getFile(konyvtar+'/foglalkozasok/aikido.jpg', {create:true}, function(){console.log('Sikeres fájl létrehozás!');}, function hiba4(e){fail(e);});
	
	if (!window.device)
	{
		navigator.webkitPersistentStorage.queryUsageAndQuota( 
			function(used, remaining) {
			  console.log("Used quota: " + used + ", remaining quota: " + remaining);
			}, function(e) {
			  console.log('Error', e); 
			} );
	}		
		
	InspectDirectory(fs,konyvtar);
}

function InspectDirectory(fs,konyvtar)
{
	var szinkronizalni = [];
	fs.root.getDirectory(konyvtar, { create: true },
		function(directory) { 
			var dirReader = directory.createReader();
			var readEntries = function()
			{
				dirReader.readEntries (function(LocalFiles) 
					 {
					  if (!LocalFiles.length) 
					  {		
						Szinkronizalas(fs,szinkronizalni);
					  } 
					  else 
					  {						
						for (var f in LocalFiles)
						{
							console.log(LocalFiles[f].fullPath);
							if (LocalFiles[f].isDirectory) 		// könyvtár				
							{
								if (!RemoteFiles[LocalFiles[f].name])					// ha nincs a szerveren ilyen könyvtár -> törölni
								{
									console.log('Könyvtárt törölni : '+LocalFiles[f].name);
								}
								else												// van ilyen könyvtár
								{
									console.log('Könyvtár rendben '+LocalFiles[f].name);
									InspectDirectory(fs,LocalFiles[f].fullPath);                 // rekurzív könytárkiolvasás
								}
							}
							else  // fájl
							{
								var parentDir = LocalFiles[f].fullPath.substring(LocalFiles[f].fullPath.indexOf("/",1)+1,LocalFiles[f].fullPath.lastIndexOf("/"));    console.log("ParentDIR: "+parentDir);
								
								var RemoteFile = GetRemoteFile(parentDir,LocalFiles[f].name);
								if (RemoteFile[0]== -1)									// ha nincs ilyen fájl a szerveren  -> törölni
								{
									console.log('Fájlt törölni : '+LocalFiles[f].name);
									// if (!RemoteFiles[parentDir])  { console.log('Könyvtárat kell törölni : '+parentDir); }
								}
								else													// ha létezik a fájl -> összehasonlítani, ha régi -> szinkronizalni
								{
									console.log("Remote file name: "+RemoteFile[1]);
									console.log("Remote file hash: "+RemoteFile[2]);
									
									console.log('Fájl rendben '+LocalFiles[f].name);
								}
							}
						}
						readEntries();
					  }
					}, fail);
				};
			readEntries();
		
		},fail);
}		


function GetRemoteFile(parentDir,localFileName)					// a szerver fájlok tömbjéből visszaadja a keresett fájl indexét,nevét,hash kódját
{
	var index = -1;
	for (var f in RemoteFiles[parentDir])
	{
		if (RemoteFiles[f][0] == localFileName) 
		{ 
			index = f;
			RemoteFileName = RemoteFiles[f][0];
			RemoteFileHash = RemoteFiles[f][1];
		}
	}
	return [index,RemoteFileName,RemoteFileHash];
}


function Szinkronizalas(fs,ToBeSynced)
{
	console.log("SZONKRONIZALAS");
	for (n in RemoteFiles)
	{
		fs.root.getDirectory( RootDirectory + "/" + n, { create: true }, null, fail);		// ha nincs ilyen, akkor is létrehoz
		for(m in RemoteFiles[n])											// könyvtáron belüli keresés
		{
			var found=false;
			for (f in LocalFiles)
			{
				if (LocalFiles[f].name==RemoteFiles[n][m][0])
				{
					found=true;
				}
			}
			if (!found || ToBeSynced.indexOf(RemoteFiles[n][m][0])!=-1) 					// letölteni ill. frissíteni kell
			{
				console.log("Letöltés : "+n+"/"+RemoteFiles[n][m][0]);
			}
		}	
	}
	RemoteFiles = [];
}
