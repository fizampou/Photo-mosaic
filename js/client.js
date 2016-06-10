var mosaic      = require('./mosaic.js');
var imagePicker = require('./imagePicker.js');
var Coords      = require('./Coords.js');
var imageSlicer = require('./imageSlicer.js');

var finalArray          = new Array(),
    dominantColorsArray = new Array(),
    workerCnt           = 0;

imagePicker.init(ImageLoaded);

// image loaded
function ImageLoaded (file) {
    var imageToSlice = file.target,
        noOfTilesX   = imageToSlice.width / mosaic.TILE_WIDTH,
        noOfTilesY   = imageToSlice.height / mosaic.TILE_HEIGHT,
        imageTiles   = imageSlicer.sliceImageIntoTiles(imageToSlice, new Coords(noOfTilesX, noOfTilesY)),
        workersCount = 4,
        blockSize    = Math.ceil(imageTiles.length / workersCount),
        canvas       = document.getElementById('canvas');

    canvas.width = imageToSlice.width;
    canvas.height = imageToSlice.height;

    for (var index = 0; index < workersCount; index++) {

        var worker = new Worker('js/tileProcessor.js');

        worker.onmessage = onWorkEnded;

        worker.postMessage({
            data: imageTiles.slice(blockSize * index, (blockSize * index) + blockSize),
            index: index
        });
    }
}


function onWorkEnded (e) {
    var subArray = e.data.result,
        dominantColors = e.data.dominantColors,
        index    = e.data.index;

    workerCnt ++;

    for (var i = 0; i < subArray.length; i++)
    {
        finalArray[i + index * subArray.length] = subArray[i];
        dominantColorsArray[i + index * subArray.length] = dominantColors[i]
    }

    if(workerCnt === 4) {
        workersDone();
    }
}

function workersDone() {
    var imageTileSize = new Coords(mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT);

    for (var i = 0; i < finalArray.length; i++) {
        for (var j = 0; j < finalArray[i].length; j++) {
            var drawPos = new Coords(i, j).multiply(imageTileSize);

            drawTileOnCanva(finalArray[i][j], dominantColorsArray[i][j],drawPos.y, drawPos.x);
        }
    }
}

// draw on canvas
function drawTileOnCanva (tile, dominantColor, positionX, positionY) {
    var canvas  = document.getElementById('canvas'),
        context = canvas.getContext('2d');
    
    // Create a Data URI (prefix + base64 encoding)
    var dominantColorData = 'data:image/svg+xml;base64,' + window.btoa(dominantColor);

    var colorImage = new Image();

    colorImage.onload = function() {
        context.putImageData(tile, positionX, positionY);
        context.globalCompositeOperation = 'soft-light';
        context.drawImage(colorImage, positionX, positionY, mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT);
    }

    colorImage.src = dominantColorData;
}
