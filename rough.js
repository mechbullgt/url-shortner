var dns = require('dns');

dns.lookup("googl#.com",(err,address, family)=>{
    if(err){
        console.log("Error while dnsing:",err);
    }
    console.log('address: %j family: IPv%s', address, family);
});

