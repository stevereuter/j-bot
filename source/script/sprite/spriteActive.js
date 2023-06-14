/** @format */

function SpriteActive(
    drawMethod,
    xStart,
    yStart,
    zStart,
    xEnd,
    yEnd,
    zEnd,
    onComplete
) {
    // private
    let x = xStart;
    let y = yStart;
    let z = zStart;

    let start = new Date().getTime();

    let difference = {
        x: xEnd - xStart,
        y: yEnd - yStart,
        z: z !== zEnd ? 0.5 : 0,
    };

    let speed = 500;

    // methods
    function draw() {
        drawMethod(x, y, z);
    }

    function update() {
        const current = new Date().getTime();
        const percent = (current - start) / speed;

        // Check status
        if (percent < 1) {
            x = difference.x * percent + xStart;
            y = difference.y * percent + yStart;
            z = difference.z * percent + zStart;
        } else {
            x = xEnd;
            y = yEnd;
            z = zEnd;
            if (onComplete) onComplete();
        }
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

    // exposed
    return {
        draw: draw,
        getX: getX,
        getY: getY,
        getZ: getZ,
        update: update,
    };
}
