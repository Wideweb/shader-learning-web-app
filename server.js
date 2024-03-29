const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(__dirname + '/dist/shader-learning'));
app.get('/*', function(req, res) { 
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.sendFile(path.join(__dirname+'/dist/shader-learning/index.html'));
});

app.listen(process.env.PORT || 8080);