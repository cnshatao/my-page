var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(__dirname));
//app.use('/static', express.static(path.join(__dirname, 'static')))
app.listen(4000, function () {
    console.log('Example app listening on port 4000.');
});