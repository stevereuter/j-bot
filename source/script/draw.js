/** @format */

function Draw(canvasId) {
    // private
    const context = document.getElementById(canvasId).getContext('2d');

    // methods
    function line(fromX, fromY, toX, toY, style) {
        context.strokeStyle = style;
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.stroke();
    }
    function grid(x, y, width, height, cellSize) {
        let row, col;

        //context.save();
        context.strokeStyle = 'darkgrey';

        for (row = x; row <= height; row += cellSize) {
            for (col = y; col <= width; col += cellSize) {
                // verticle
                line(col, y, col, width);

                // horizontal
                line(x, row, height, row);
            }
        }
        //context.restore();
    }

    function circle(x, y, radius, lineSize, fill, stroke) {
        context.beginPath();
        context.strokeStyle = stroke;
        context.fillStyle = fill;
        context.lineWidth = lineSize;
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fill();
        context.stroke();
        context.closePath();
    }

    function robot(x, y, z) {
        const radius = 14;
        context.save();

        context.translate(x + 20, y + 20);
        context.rotate(z * Math.PI);

        circle(0, 0, radius, radius * 0.05, '#ff7777', 'black');
        circle(
            0 - radius / 2,
            0 - radius / 2,
            radius * 0.25,
            1,
            'blue',
            'black'
        );
        circle(
            0 + radius / 2,
            0 - radius / 2,
            radius * 0.25,
            1,
            'blue',
            'black'
        );

        context.restore();
    }

    function beacon(x, y) {
        circle(x + 20, y + 20, 8, 1, 'orange', 'black');
    }

    function zone(x, y) {
        context.fillStyle = 'yellow';
        context.fillRect(x + 1, y + 1, 38, 38);
    }

    function zoneActive(x, y) {
        context.fillStyle = 'green';
        context.fillRect(x, y, 40, 40);
        beacon(x, y);
    }

    function wall(x, y) {
        context.fillStyle = 'darkgrey';
        context.fillRect(x, y, 40, 40);
    }

    function clear() {
        context.clearRect(0, 0, 400, 400);
    }

    // exposed
    return {
        clear: clear,
        drawGrid: grid,
        drawRobot: robot,
        drawBeacon: beacon,
        drawZone: zone,
        drawZoneActive: zoneActive,
        drawWall: wall,
    };
}
