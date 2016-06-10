self.onmessage = function(e) {
    var data =  e.data.data;
    var index = e.data.index;
    var dominantColorsX = new Array();
    var dominantColors = new Array();

    for (var i = 0; i < data.length; i++)
    {
        for (var j = 0; j < data[i].length; j++) {
              var dominantColor = getColors(data[i][j]);

              var xhr = new XMLHttpRequest();
              xhr.open('GET', "http://localhost:8765/color/" + dominantColor, false);

              xhr.addEventListener("readystatechange", function(e) {
                  if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
                      dominantColorsX.push(e.currentTarget.response);
                  } else {
                      // wrong color? set black as failsafe
                      var svgTemplate = [
                        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16">',
                          '<ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="#000000"></ellipse>',
                        '</svg>'
                      ].join('');

                      dominantColorsX.push(svgTemplate);
                }
              }, false);

              xhr.send();
        }

        dominantColors.push(dominantColorsX);
        dominantColorsX = [];
    }

    self.postMessage({
        result: data,
        dominantColors: dominantColors,
        index: index
    });
};

// average color of tile
function getColors(pixels) {
    var hexColor,
        rgbColor = {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        },
        colors = {},
        dominantColor = {
            hexColor: '',
            count: 0
        };

    for (var i = 0, data = pixels.data; i < data.length; i += 4) {
        rgbColor.r = data[i];
        rgbColor.g = data[i + 1];
        rgbColor.b = data[i + 2];
        rgbColor.a = data[i + 3];

        // skip pixels >50% transparent
        if (rgbColor.a < (255 / 2))
            continue;

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
