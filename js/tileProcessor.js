// Tile processing is happening here
// dominant color per tile and xhr request to
// fetch each color. When a row is ready with
// all dominant colors we send the result.

var helpers = require('./helpers.js'),
    module  = module || null;

function error(err) {
    console.log('error' + err);
}

function prepareRow(data, i, index) {
    return new Promise(function (resolve) {
        var row            = i + index * data.length,
            dominantColors = [],
            j              = 0;

        for (j; j < data[i].length; j++) {
            dominantColors.push(helpers.colorFetcher("http://localhost:8765/color/" + helpers.getHexColor(data[i][j])));
        }
        dominantColors.push(row); // push the position

        Promise.all(dominantColors).then(function (dominantColors) {
            var position  = dominantColors.pop(); // get the position

            resolve({
                dominantColors: dominantColors,
                tiles : data[i],
                isLastRow : (i === data.length - 1), // bool used by main thread to kill the workers
                position: position
            });
        }, error);
    });
}

function onMessage(e) {
    var data  = e.data.data,
        index = e.data.index,
        i     = 0;

    for (i; i < data.length; i++) {
        prepareRow(data, i, index).then(message, error);
    }
}

function message(result) {
    postMessage({
        result: result.tiles,
        colors: result.dominantColors,
        row: result.position,
        isLastRow : result.isLastRow
    });
}

if (module && module.exports) {
    module.exports = function (self) {
        self.addEventListener('message', onMessage);
    };
}
