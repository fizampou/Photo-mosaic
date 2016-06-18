// Image picker calls the callback function
// passed when the file image file is loaded

var exports = exports || null,
    callback;

// image loaded
function ImageLoaded(file) {
    callback(file);
}

// file loaded
function fileLoaded(file) {
    var image = new Image();

    image.addEventListener('load', ImageLoaded, false);

    image.src = file.target.result;
}

// file selection handler
function handleFileSelect(evt) {
    var file   = evt.target.files[0],
        reader = new FileReader();

    if (file.type.match('image.*') === false) {
        return;
    }

    reader.addEventListener('load', fileLoaded, false);
    reader.readAsDataURL(file);
}

if (exports) {
    exports.init = function (callbck) {
        document.getElementById('file').addEventListener('change', handleFileSelect, false);
        callback = callbck;
    };
}
