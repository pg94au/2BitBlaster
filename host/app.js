var express = require('express');
var fs = require('fs');

var app = express();

app.use(express.static('public'));

app.get('/test', function (req, res) {
    res.send('Hello World!');
});

app.put('/highScore', function(req, res) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', function() {
        //req.send("You posted " + data);
        console.log('You posted ' + data);
        var incomingHighScore = parseInt(data);
        fs.readFile('./public/highScore', function(error, data) {
            if (error) { return; }

            var currentHighScore = parseInt(data);

            if (incomingHighScore > currentHighScore) {
                currentHighScore = incomingHighScore;
                fs.writeFile('./public/highScore', currentHighScore.toString(), function(error) {
                    if (error) {
                        console.log('Failed to write new high score ' + currentHighScore);
                    }
                });
            }

            res.send(currentHighScore.toString());
        });
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
