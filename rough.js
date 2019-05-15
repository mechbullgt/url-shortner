var dns = require('dns');

dns.lookup("https://www.freecodecamp.org",(err,address, family)=>{
    if(err){
        console.log("Error while dnsing:",err);
    }
    console.log('address: %j family: IPv%s', address, family);
});
