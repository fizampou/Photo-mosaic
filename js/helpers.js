// Get the hex value of the dominant color per tile

var exports  = exports || null,
    svgBlack = ['<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16">',
                '<ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="#000000"></ellipse>',
                '</svg>'].join('');

// rgb to hex
function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

if (exports) {
    // hex value of the average color of pixels param
    exports.getHexColor = function (pixels) {
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
    };

    exports.colorFetcher = function (url) {
        return new Promise(function (resolve) {
            var request = new XMLHttpRequest();
            request.open('GET', url);

            request.onload = function () {
                if (request.status === 200) {
                    resolve(request.response);
                } else {
                    resolve(svgBlack); // error? set black as failsafe
                }
            };
            request.onerror = function () {
                resolve(svgBlack); // network error? set black as failsafe
            };
            request.send();
        });
    };
}
