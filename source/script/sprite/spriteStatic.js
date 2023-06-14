/** @format */

function SpriteStatic(drawMethod, x, y, z, name, itemCount) {
    // methods
    function draw() {
        drawMethod(x, y, z);
    }

    function update() {}

    function getName() {
        return name;
    }

    function getX() {
        return x;
    }

    function getY() {
        return y;
    }

    function getZ() {
        return z;
    }

    function getItemCount() {
        return itemCount;
    }

    // constructor
    (function () {
        if (!itemCount) {
            itemCount = 0;
        }
    })();

    // exposed
    return {
        draw: draw,
        getName: getName,
        getX: getX,
        getY: getY,
        getZ: getZ,
        update: update,
        getItemCount: getItemCount,
    };
}
