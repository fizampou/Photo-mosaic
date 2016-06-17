var exports = exports || null;

function Coords(x, y) {
    this.x = x;
    this.y = y;

    this.divide = function (other) {
        this.x /= other.x;
        this.y /= other.y;

        return this;
    };

    this.multiply = function (other) {
        this.x *= other.x;
        this.y *= other.y;

        return this;
    };

    this.overwriteWith = function (other) {
        this.x = other.x;
        this.y = other.y;

        return this;
    };
}

if (exports) {
    module.exports = Coords;
}
