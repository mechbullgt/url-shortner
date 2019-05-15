var dns = require('dns');

dns.lookup("google.com",(err,address, family)=>{
    if(err){
        console.log("Error while dnsing:",err);
    }
    console.log('address: %j family: IPv%s', address, family);
});

