var mosaic      = require('./mosaic.js');
var Coords      = require('./Coords.js');

var exports = exports || null;

if (exports) {
    // slice image into tiles
    exports.sliceImageIntoTiles = function(imageToSlice, sizeInTiles) {
        var totalTiles       = [],
            tilesX           = [],
            tilePos          = new Coords(0, 0),
            sourcePos        = new Coords(0, 0),
            tileSize         = new Coords(mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT),
            canvas           = document.createElement('canvas'),
            context          = canvas.getContext('2d');

        canvas.width = imageToSlice.width;
        canvas.height = imageToSlice.height;

        context.drawImage(imageToSlice, 0, 0);

        for (var y = 0; y < sizeInTiles.y; y++)
        {
            tilePos.y = y;
            for (var x = 0; x < sizeInTiles.x; x++)
            {
                tilePos.x = x;
                sourcePos.overwriteWith(tilePos).multiply(tileSize);

                tilesX.push(context.getImageData(sourcePos.x, sourcePos.y, tileSize.x, tileSize.y));
            }

            totalTiles.push(tilesX);
            tilesX = []; // reset rows items
        }
        return totalTiles;
    }
}
