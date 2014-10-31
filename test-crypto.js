var crypto = require('crypto');
//解密 
function decode(cryptkey, iv, secretdata) {
    var
        decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv),
        decoded  = decipher.update(secretdata, 'base64', 'utf8');

    decoded += decipher.final( 'utf8' );
    return decoded;
}
//解密 
function encode(cryptkey, iv, cleardata) {
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptkey, iv),
        encoded  = encipher.update(cleardata, 'utf8', 'base64');
    encoded += encipher.final( 'base64' );
    return encoded;
}

var cryptkey   = crypto.createHash('sha256').update('__tazai_wolf__key').digest(),
    iv         = '1234567890000000',
    iv2        = '1234567890000001',
    buf        = "Hello World",
    enc        = encode( cryptkey, iv, buf );

var dec        = decode(cryptkey, iv, enc);

function b64enc(data) {
    var b   = new Buffer(data, 'binary');
    return b.toString('base64');
}

console.warn("Encoded length: ", enc);
console.warn("Decoded all: " + dec);


// async
crypto.randomBytes(256, function(ex, buf) {
    if (ex) throw ex;
    console.log('Have %d bytes of random data: %s', buf.length, buf);
});
// sync
try {
    var buf = crypto.randomBytes(256);
    console.log('Have %d bytes of random data: %s', buf.length, buf);
} catch (ex) {
    // handle error
}