// Tile processing is happening here
// dominant color per tile and xhr request to
// fetch each color. When a row is ready with
// all dominant colors we send the result.

onmessage = onMessage;

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

function prepareRow(data, i, index) {
    return new Promise(function (resolve) {
        var row            = i + index * data.length,
            dominantColors = [],
            j              = 0;

        for (j; j < data[i].length; j++) {
            dominantColors.push(colorFetcher("http://localhost:8765/color/" + getColors(data[i][j])));
        }
        dominantColors.push(row); // push the position

        Promise.all(dominantColors).then(function (dominantColors) {
            var position  = dominantColors.pop(); // get the position

            resolve({
                dominantColors: dominantColors,
                tiles : data[i],
                isLastRow : (i === data.length - 1),
                position: position
            });
        }, error);
    });
}

function colorFetcher(url) {
    // error? set black as failsafe
    var svgBlack = ['<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16">',
                    '<ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="#000000"></ellipse>',
                    '</svg>'].join('');

    return new Promise(function (resolve) {
        var request = new XMLHttpRequest();
        request.open('GET', url);

        request.onload = function () {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                resolve(svgBlack);
            }
        };
        request.onerror = function () {
            resolve(svgBlack);
        };
        request.send();
    });
}

function error(error) {
    console.log('error' + error);
}

// average color of tile
function getColors(pixels) {
    var hexColor,
        rgbColor = {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        },
        dominantColor = {
            hexColor: '',
            count: 0
        },
        colors = {},
        i      = 0,
        data   = pixels.data;

    for (i; i < data.length; i += 4) {
        rgbColor.r = data[i];
        rgbColor.g = data[i + 1];
        rgbColor.b = data[i + 2];
        rgbColor.a = data[i + 3];

        // skip pixels >50% transparent
        if (rgbColor.a < (255 / 2)) {
            continue;
        }

        hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
        if (!colors[hexColor]) {
            colors[hexColor] = 0;
        }

        colors[hexColor]++;

        if (colors[hexColor] > dominantColor.count) {
            dominantColor.count = colors[hexColor];
            dominantColor.hexColor = hexColor;
        }
    }

    return dominantColor.hexColor;
}

// rgb to hex
function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
