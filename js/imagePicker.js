var exports = exports || null,
    callback;

if (exports) {

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

    // file loaded
    function fileLoaded (file) {
        var image = new Image();

        image.addEventListener('load', ImageLoaded, false);

        image.src = file.target.result;
    }

    // image loaded
    function ImageLoaded (file) {
        callback(file);
    }

    exports.init = function (callbck) {
        document.getElementById('file').addEventListener('change', handleFileSelect, false);
        callback = callbck;
    }
}
