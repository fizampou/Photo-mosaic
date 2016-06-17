var mosaic              = require('./mosaic.js'),
    imagePicker         = require('./imagePicker.js'),
    Coords              = require('./Coords.js'),
    imageSlicer         = require('./imageSlicer.js'),
    tilesArray          = [],
    dominantColorsArray = [],
    drawingPointer      = 0,
    workersCount        = 4,
    pendingWorkers      = 4,
    workersArray        = [workersCount];

imagePicker.init(ImageLoaded);

// image loaded
function ImageLoaded (file) {
    var imageToSlice = file.target,
        noOfTilesX   = imageToSlice.width / mosaic.TILE_WIDTH,
        noOfTilesY   = imageToSlice.height / mosaic.TILE_HEIGHT,
        imageTiles   = imageSlicer.sliceImageIntoTiles(imageToSlice, new Coords(noOfTilesX, noOfTilesY)),
        blockSize    = Math.ceil(imageTiles.length / workersCount),
        canvas       = document.getElementById('canvas');

    canvas.width = imageToSlice.width;
    canvas.height = imageToSlice.height;

    for (var index = 0; index < workersCount; index++) {

        workersArray[index] = new Worker('js/tileProcessor.js');

        workersArray[index].onmessage = onWorkEnded;

        workersArray[index].postMessage({
            data: imageTiles.slice(blockSize * index, (blockSize * index) + blockSize),
            index: index
        });
    }
}

function onWorkEnded (e) {
    var tilesRow          = e.data.result,
        dominantColorsRow = e.data.colors,
        row               = e.data.row,
        isLastRow         = e.data.isLastRow;

    if (isLastRow) {
        pendingWorkers --;
    }

    tilesArray[row] = tilesRow;
    dominantColorsArray[row] = dominantColorsRow;

    if (pendingWorkers === 0) {
        workersArray.forEach(terminateWorker);
        do {
            drawRow(tilesArray[drawingPointer], dominantColorsArray[drawingPointer], drawingPointer);
            drawingPointer ++;
        } while( tilesArray[drawingPointer] );
    }
}

function terminateWorker(elm) {
    elm.terminate();
}

function drawRow(tiles, colors, position) {
    var imageTileSize = new Coords(mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT);

    for (var j = 0; j < tiles.length; j++) {
        var drawPos = new Coords(position, j).multiply(imageTileSize);

        drawTileOnCanva(tiles[j], colors[j], drawPos.y, drawPos.x);
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
    };

    colorImage.src = dominantColorData;
}
