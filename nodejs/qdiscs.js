// Simple Web Server to tweak qdisc schedulers

// /////////////////////////////////////////
// /////////////////////////////////////////
// global vars and options
// /////////////////////////////////////////
// /////////////////////////////////////////


var fs = require('fs'); 
var http = require('http'); 
const { parse } = require('querystring');
const { execSync } = require('child_process');


var serverList = 
{
  numberServers:3,
  servers:[
            {"name":"shaper1","ip":"10.8.0.1","user":"root","keyFile":"id_shaper1","interfaces":["eth0","eth1"]},
            {"name":"shaper2","ip":"10.7.0.1","user":"root","keyFile":"id_shaper2","interfaces":["eth0","eth1"]},
            {"name":"shaper3","ip":"10.9.0.1","user":"root","keyFile":"id_shaper3","interfaces":["eth0","eth1"]}
          ]
}

// /////////////////////////////////////////
// /////////////////////////////////////////
// Server
// /////////////////////////////////////////
// /////////////////////////////////////////


var server = http.createServer();

server.listen(8080),() => 
{
  console.log(new Date()+' LISTENING ');
}


// /////////////////////////////////////////
// /////////////////////////////////////////
// Request-Handler
// /////////////////////////////////////////
// /////////////////////////////////////////

var theResult = "";

server.on("request", (request, response) => 
{

// /// log the request on the console

  console.log(new Date()+' REQUEST '+ 
    request.connection.remoteAddress+' '+ 
    request.method+' '+request.url); 

  var body = [];

  // //////////////////////
  request
  // //////////////////////
      

    // end of request
    // //////////////////////

    .on("end", () => 
      {
        body = body.concat.toString();
        console.log("END");
      }
    )

    // error 400
    // //////////////////////
      
    .on("error", () => 
      {
        response.statusCode = 400;
        response.end();
        console.log("REQ.ERROR");
      }
    )

    // data received
    // //////////////////////
      
    .on("data", chunk => 
      {

//        if (( "POST" == request.method ) && ("/formdata" == request.url )) 
        if ( "POST" == request.method )
        {
          //response.writeHead(200, {'Content-Type':'text/plain'});
          console.log("REQUEST.DATA");
          console.log(chunk.toString());
          theResult = dataHandler(request,chunk);
          response.end(theResult);

        } 
      }
    )
  ;

  // //////////////////////
  response
  // //////////////////////

    .on("error", err => 
      {
        console.err(err);
        console.log("RESP.ERROR");
      }
    )
  ;


  // analyze the URL - we only need one for the html file and one for 
  // the Form data response
  // everything else just throws a blunt 401

  if ( "GET" == request.method )  
  {
    console.log("FH");
    formHandler(request,response);
  } 
  else
//    if (( "POST" == request.method ) && ("/formdata" == request.url )) 
    if (( "POST" == request.method ))
    {
        console.log("FR");
        formReceived(request,response);
    } 
    else
    {
        console.log("401");
        response.writeHead(401);
        response.end();
    }
  console.log("=== OK === ");

});

// /////////////////////////////////////////
// send the form
// /////////////////////////////////////////


var formHandler = function (request, response) {

  console.log("FORMHANDLER");

  var htmlFileContent=fs.readFileSync("index.html",'utf8');
  var serverBlockFileContent=fs.readFileSync("serverblock.html",'utf8');
  var ifBlockFileContent=fs.readFileSync("ifblock.html",'utf8');
  var serverBlockReply="";

  // fill the blocks for each server from the template

  for (var servNum=0; servNum <= serverList.numberServers -1 ; servNum++)
  {
    var ifBlockReply ="";
    var numInterfaces = serverList.servers[servNum].interfaces.length;

    // fill the blocks for each interface on that server from the template

    for (var ifNum=0; ifNum <= numInterfaces -1 ; ifNum++)
    {
      ifBlockReply += ifBlockFileContent.replace(/\$INTERFACENAME\$/g,serverList.servers[servNum].interfaces[ifNum]);
    }
    ifBlockReply = ifBlockReply.replace(/\$SERVERNAME\$/g,serverList.servers[servNum].name);
    serverBlockReply += serverBlockFileContent.replace(/\$SERVERNAME\$/g,serverList.servers[servNum].name);
    serverBlockReply = serverBlockReply.replace(/\$IFBLOCK\$/g,ifBlockReply);
    serverBlockReply = serverBlockReply.replace(/\$SERVERIP\$/g,serverList.servers[servNum].ip);
    serverBlockReply = serverBlockReply.replace(/\$KEYFILE\$/g,serverList.servers[servNum].keyFile);
  }


  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(htmlFileContent.replace(/\$SERVERBLOCK\$/g,serverBlockReply));
  response.end(); 
}

// /////////////////////////////////////////
// receive the form data
// /////////////////////////////////////////


var formReceived = function (request, response) {
    console.log("FORMRECEIVED");
    console.log(request.data);
    response.writeHead(200);
}

var dataHandler = function (request, chunkdata) {
    console.log("DATAHANDLER");
    //console.log(chunkdata);
    var parseddata = chunkdata.toString();
    console.log (parseddata);
    var jsonObject = JSON.parse(parseddata);

    numberOfInterfaces = jsonObject["numinterfaces"];
    console.log("Interfaces : " + numberOfInterfaces);
  
    var theResult = "";

    for (var ifNum=1; ifNum <= numberOfInterfaces ; ifNum++)
    {
      console.log("1");
      var commandString = 'ssh -q -oStrictHostKeyChecking=no -i ' + 
        jsonObject["keyfilename"] + ' root\@'  +
        jsonObject["ipaddress"] + ' \"tc qdisc del dev ' +
        jsonObject["interfacename_" + ifNum] + ' root netem ; tc qdisc add dev ' +
        jsonObject["interfacename_" + ifNum] + ' root netem loss random ' +
        jsonObject["errorrate_" + ifNum] + ' delay ' +
        jsonObject["delay_" + ifNum] + ' rate ' +
        jsonObject["rate_" + ifNum] + '\"';
      console.log(commandString);
      theResult += commandString + "\n" ;
      theResult += runExternalCommand(commandString);
    }

    return (theResult);

}

function runExternalCommand(cmd) {

  var cmdResult =""

  try {
    var res = execSync(cmd);
  } catch (e) {
    cmdResult += e.toString();
  } 
  cmdResult += res;

  return (cmdResult);
}

