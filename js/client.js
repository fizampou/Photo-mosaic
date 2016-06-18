var mosaic              = require('./mosaic.js'),
    imagePicker         = require('./imagePicker.js'),
    Coords              = require('./Coords.js'),
    imageSlicer         = require('./imageSlicer.js'),
    tilesArray          = [], // Array holding tiles
    dominantColorsArray = [], // Array holding dominant colors per tile
    drawingPointer      = 0,  // Pointer on our drawn rows
    workersCount        = 4,  // Number of workers
    pendingWorkers      = workersCount,  // Counter of finished workers
    workersArray        = [workersCount], // Array holding our workers
    canvas              = document.getElementById('canvas'); //Canvas to draw the final image

imagePicker.init(ImageLoaded);

// image loaded
function ImageLoaded (file) {
    var imageToSlice = file.target,
        noOfTilesX   = imageToSlice.width / mosaic.TILE_WIDTH,
        noOfTilesY   = imageToSlice.height / mosaic.TILE_HEIGHT,
        imageTiles   = imageSlicer.sliceImageIntoTiles(imageToSlice, new Coords(noOfTilesX, noOfTilesY));

    //TODO: clean the canvas on second image

    // set canvas dimensions equal to image dimensions
    canvas.width = imageToSlice.width;
    canvas.height = imageToSlice.height;

    assignToImageWorkers(imageTiles);
}

// Create the workers and assing them some tasks
function assignToImageWorkers(imageTiles) {
    var blockSize = Math.ceil(imageTiles.length / workersCount), // round the blocksize to the greater or equal intiger number
        index     = 0;

    for (index; index < workersCount; index++) {
        workersArray[index] = new Worker('js/tileProcessor.js');
        workersArray[index].onmessage = onRowReady;
        workersArray[index].postMessage({
            data: imageTiles.slice(blockSize * index, (blockSize * index) + blockSize),
            index: index
        });
    }
}

// Save the ready rows of dominant colors and tiles to the final arrays
// when all workers are done send for the results for drawing per row
function onRowReady (e) {
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

// Draw row on canvas
function drawRow(tiles, colors, position) {
    var imageTileSize = new Coords(mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT),
        j             = 0,
        drawPos;

    for (j; j < tiles.length; j++) {
        drawPos = new Coords(position, j).multiply(imageTileSize);

        drawTileOnCanva(tiles[j], colors[j], drawPos.y, drawPos.x);
    }
}

// Draw tile on canvas with the dominant color
function drawTileOnCanva (tile, dominantColor, positionX, positionY) {
    var context           = canvas.getContext('2d'),
        dominantColorData = 'data:image/svg+xml;base64,' + window.btoa(dominantColor), // Create a Data URI (prefix + base64 encoding)
        colorImage        = new Image();

    colorImage.onload = function() {
        context.putImageData(tile, positionX, positionY);
        context.globalCompositeOperation = 'soft-light';
        context.drawImage(colorImage, positionX, positionY, mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT);
    };
    colorImage.src = dominantColorData;
}

// Terminate all workers
function terminateWorker(elm) {
    elm.terminate();
}
