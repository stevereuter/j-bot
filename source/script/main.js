/** @format */

// main page script
var main = (function () {
    // private properties
    let actionQueue;
    let commandInputElement;
    let outputElement;
    let canvasDraw;
    let gridSize;
    let cellCount;
    let jBot;
    let itemCount;
    let buttonClicked;
    let canvasElement;
    let spriteManager;
    // private methods

    function showMessage(message) {
        if (outputElement.innerHTML) {
            message = `<br />${message}`;
        }
        outputElement.innerHTML += message;
    }

    function addMessageToQueue(message) {
        actionQueue.push(function (next) {
            showMessage(message);
            return next;
        });
    }

    function exit() {
        const x = jBot.getX();
        const y = jBot.getY();
        const z = jBot.getZ();
        jBot = new SpriteStatic(canvasDraw.drawRobot, x, y, z);
        actionQueue = [];
        showMessage("J-Bot powered down...");
    }

    function process() {
        const firstIndex = 0;

        if (actionQueue.length > 0) {
            const current = actionQueue[firstIndex];
            actionQueue.splice(firstIndex, 1);
            const next = current(process);

            if (next) {
                next();
            }
        } else {
            // no more methods to process
            exit();
        }
    }

    function getCanvasPosition(event) {
        const rect = canvasElement.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    function getClickPosition(event) {
        const pos = getCanvasPosition(event);
        const cell = getCellSize();
        let x, y;

        x = Math.floor(pos.x / cell);
        x *= cell;
        y = Math.floor(pos.y / cell);
        y *= cell;
        return { x, y };
    }

    // button events
    function run() {
        addMessageToQueue("J-Bot power up...");
        try {
            eval(commandInputElement.value);
        } catch (ex) {
            showMessage(
                "The following exception prevented the command from being run."
            );
            showMessage(ex);
            actionQueue = [];
            return;
        }

        process();
    }

    function clear() {
        outputElement.innerHTML = "";
    }

    function clearCode() {
        userCode.value = "";
    }

    function isPositionValid(x, y, z) {
        if (spriteManager.isBlocked(x, y)) return false;

        if (z === 0 && y >= 0) return true;
        if (z === 0.5 && x <= 360) return true;
        if (z === 1 && y <= 360) return true;
        if (z === 1.5 && x >= 0) return true;

        return false;
    }

    function jBotButtonClick(event) {
        event.preventDefault();
        var { x, y } = getClickPosition(event);

        jBot = new SpriteStatic(canvasDraw.drawRobot, x, y, 0);
    }

    function setupButtonClicked(name) {
        if (name === "ClearAll") {
            spriteManager.removeAll();
            return;
        }
        let messsageText = "Click a cell on the grid to ";
        buttonClicked = name;
        if (name == "Clear") {
            messsageText += name;
        } else {
            messsageText += "place " + name;
        }
        showMessage(messsageText);
    }

    function placeZone(x, y) {
        const zone = new SpriteStatic(canvasDraw.drawZone, x, y, 0, "zone");
        spriteManager.add(zone.getX(), zone.getY(), zone);
    }

    function placeZoneButtonClick(event) {
        event.preventDefault();
        const { x, y } = getClickPosition(event);
        placeZone(x, y);
    }

    function placeWall(x, y) {
        const wall = new SpriteStatic(canvasDraw.drawWall, x, y, 0, "wall");
        spriteManager.add(wall.getX(), wall.getY(), wall);
    }

    function placeWallButtonClick(event) {
        event.preventDefault();
        const { x, y } = getClickPosition(event);
        placeWall(x, y);
    }

    function placeBeacon(x, y) {
        const beacon = new SpriteStatic(
            canvasDraw.drawBeacon,
            x,
            y,
            0,
            "beacon"
        );
        spriteManager.add(beacon.getX(), beacon.getY(), beacon);
    }

    function beaconButtonClick(event) {
        event.preventDefault();
        const { x, y } = getClickPosition(event);
        placeBeacon(x, y);
    }

    function clearCellButtonClick(event) {
        event.preventDefault();
        const { x, y } = getClickPosition(event);
        spriteManager.remove(x, y);
    }

    function canvasClickEvent(event) {
        if (buttonClicked) {
            switch (buttonClicked) {
                case "J-Bot":
                    jBotButtonClick(event);
                    break;
                case "Beacon":
                    beaconButtonClick(event);
                    break;
                case "Wall":
                    placeWallButtonClick(event);
                    break;
                case "Zone":
                    placeZoneButtonClick(event);
                    break;
                case "Clear":
                    clearCellButtonClick(event);
                    break;
            }
            buttonClicked = undefined;
        }
    }

    function getRandomCoordinate() {
        return Math.floor(Math.random() * 10) * 40;
    }

    function getRandomDirection() {
        const direction = Math.floor(Math.random() * 15);
        return (Math.ceil(direction / 5) * 5) / 10;
    }

    function getOpenPosition() {
        const x = getRandomCoordinate();
        const y = getRandomCoordinate();
        // console.log('x: ' + x/40 + ', y: ' + y/40 + ', ' + spriteManager.getType(x, y));
        if (!spriteManager.getType(x, y)) {
            return { x, y };
        } else {
            return getOpenPosition();
        }
    }

    function placeItem(method) {
        const { x, y } = getOpenPosition();
        method(x, y);
    }

    function createRandomMap() {
        const beaconCount = 3;
        const zoneCount = 3;
        const wallCount = 20;

        for (let i = 0; i < beaconCount; i++) {
            // console.log('Place beacon');
            placeItem(placeBeacon);
        }
        for (let i = 0; i < zoneCount; i++) {
            // console.log('Place zone');
            placeItem(placeZone);
        }
        for (let i = 0; i < wallCount; i++) {
            // console.log('Place wall');
            placeItem(placeWall);
        }

        const { x, y } = getOpenPosition(),
            z = getRandomDirection();

        jBot = new SpriteStatic(canvasDraw.drawRobot, x, y, z);
    }

    function outputCommandList() {
        const commands = [];
        commands.push(
            "Using jBot's commands, move jBot around the map to pick up the items and drop them on the zones."
        );
        commands.push("<br>Basic methods that perform an action:");
        commands.push("move() - moves jBot one space forward");
        commands.push("turn() - rotates jBot 90 degrees to the right");
        commands.push("take() - picks up item on the same space as jBot is on");
        commands.push(
            "drop() - drops all items on the same space as jBot is on"
        );
        commands.push("scan() - displays states for map and jBot");
        commands.push(
            "log() - displays text in the output window, can be used for identification in custom commands"
        );
        commands.push(
            "<br>Callback methods that perform an action based on criteria:"
        );
        commands.push(
            "repeat(action, number of times to repeat) - repeats an action"
        );
        commands.push(
            "canMove(true action, false action) - tests if jBot can move"
        );
        commands.push(
            "canTake(true action, false action) - tests if jBot is on an item"
        );
        commands.push(
            "canDrop(true action, false action) - tests if jBot on a drop zone"
        );
        commands.push(
            "<br>You can also create custom commands in JavaScript that can include any of jBot's methods, such as:"
        );
        commands.push(
            "function left() {<br>&nbsp;&nbsp;repeat(turn, 3);<br>}<br>"
        );
        commands.push(
            "This allows you to simply write left(); when you want jBot to turn left."
        );

        showMessage(commands.join("<br>"));
    }

    // jBot actions
    function forward(next) {
        let x, y, z, xEnd, yEnd;

        // need to get location
        // need to see if new space is movable

        x = jBot.getX();
        y = jBot.getY();
        z = jBot.getZ();

        switch (z) {
            case 0:
                xEnd = x;
                yEnd = y - 40;
                break;
            case 0.5:
                xEnd = x + 40;
                yEnd = y;
                break;
            case 1:
                xEnd = x;
                yEnd = y + 40;
                break;
            case 1.5:
                xEnd = x - 40;
                yEnd = y;
                break;
        }

        if (isPositionValid(xEnd, yEnd, z)) {
            showMessage("Moving");
            jBot = new SpriteActive(
                canvasDraw.drawRobot,
                x,
                y,
                z,
                xEnd,
                yEnd,
                z,
                next
            );
        } else {
            showMessage("Program error - jBot cannot move to that position");
            exit();
        }
    }

    function rotate(next) {
        let x, y, z, zEnd;

        x = jBot.getX();
        y = jBot.getY();
        z = jBot.getZ();

        if (z === 1.5) {
            zEnd = 0;
        } else {
            zEnd = z + 0.5;
        }

        showMessage("Turning clockwise");
        jBot = new SpriteActive(
            canvasDraw.drawRobot,
            x,
            y,
            z,
            x,
            y,
            zEnd,
            next
        );
    }

    function takeBeacon(next) {
        let x, y, item;
        showMessage("Taking item");

        x = jBot.getX();
        y = jBot.getY();
        item = spriteManager.getType(x, y);

        if (item === "beacon") {
            itemCount += 1;
            showMessage("Item count: " + itemCount);
            spriteManager.remove(x, y);
            return next;
        } else {
            showMessage("Program error - jBot cannot take item");
            exit();
        }
    }

    function dropBeacon(next) {
        showMessage("Dropping item");
        if (itemCount > 0) {
            let x, y, cell, sprite;
            x = jBot.getX();
            y = jBot.getY();
            cell = spriteManager.getType(x, y);

            if (cell === "zone") {
                // create an active zone

                sprite = new SpriteStatic(
                    canvasDraw.drawZoneActive,
                    x,
                    y,
                    undefined,
                    "zone",
                    itemCount
                );
                showMessage("Items dropped: " + itemCount);
                itemCount = 0;
            } else {
                // create a beacon
                sprite = new SpriteStatic(
                    canvasDraw.drawBeacon,
                    x,
                    y,
                    undefined,
                    "beacon"
                );
            }

            spriteManager.add(x, y, sprite);
            return next;
        } else {
            showMessage("Program error - jBot does not have any items to drop");
            exit();
        }
    }

    // jBot commands (callable)
    function move(isNext) {
        if (isNext) {
            actionQueue.unshift(forward);
        } else {
            actionQueue.push(forward);
        }
    }

    function turn(isNext) {
        if (isNext) {
            actionQueue.unshift(rotate);
        } else {
            actionQueue.push(rotate);
        }
    }

    function take(isNext) {
        if (isNext) {
            actionQueue.unshift(takeBeacon);
        } else {
            actionQueue.push(takeBeacon);
        }
    }

    function drop(isNext) {
        if (isNext) {
            actionQueue.unshift(dropBeacon);
        } else {
            actionQueue.push(dropBeacon);
        }
    }

    function canDrop(nextTrue, nextFalse) {
        actionQueue.push(function (next) {
            showMessage("Checking for zone...");
            // get the current location
            const x = jBot.getX();
            const y = jBot.getY();
            // see if sprite manager has an item
            const cellContents = spriteManager.getType(x, y);
            // output resuts
            const hasBeacon = cellContents && cellContents === "zone";
            let messageText = "";
            let nextQueueItem;
            if (hasBeacon) {
                messageText = "Zone found!";
                nextQueueItem = nextTrue;
            } else {
                messageText = "No zone found!";
                nextQueueItem = nextFalse;
            }
            showMessage(messageText);
            nextQueueItem(true);
            // return next
            return next;
        });
    }

    function scan() {
        actionQueue.push(function (next) {
            showMessage("Scanning...");
            const beacons = spriteManager.getSprites("beacon");
            const zones = spriteManager.getSprites("zone");
            const zoneItems = [];
            for (let id in zones) {
                if (zones.hasOwnProperty(id)) {
                    const zone = zones[id];
                    if (zone && zone.getItemCount() > 0) {
                        zoneItems.splice(id, 0, zone);
                    }
                }
            }
            let zoneItemSum = 0;
            for (let id in zoneItems) {
                if (zoneItems.hasOwnProperty(id)) {
                    const zone = zoneItems[id];
                    zoneItemSum += zone.getItemCount();
                }
            }
            showMessage("Item count: " + beacons.length);
            showMessage("Items in zones: " + zoneItemSum);
            showMessage("J-Bot inventory: " + itemCount);
            const isSuccess =
                itemCount === 0 &&
                beacons.length === 0 &&
                zones.length === zoneItems.length &&
                zoneItems.length > 0 &&
                zoneItemSum > 0;
            let messageText =
                "Success, all items are in zones and no zones are empty.";
            if (!isSuccess) {
                if (itemCount > 0) {
                    messageText = "jBot has not dropped all items.";
                } else if (beacons.length) {
                    messageText = "There are items not in zones on the map.";
                } else if (zones.length > zoneItems.length) {
                    messageText = "Not all zones have items";
                } else {
                    messageText = "Not all tasks are complete.";
                }
            }
            showMessage(messageText);
            next();
        });
    }

    function repeat(method, count) {
        log(`Repeating ${method.name} ${count} times`);
        for (let i = 0; i < count; i += 1) {
            method();
        }
    }

    function canTake(nextTrue, nextFalse) {
        actionQueue.push(function (next) {
            showMessage("Checking for beacon...");
            // get the current location
            const x = jBot.getX();
            const y = jBot.getY();
            // see if sprite manager has an item
            const cellContents = spriteManager.getType(x, y);
            // output resuts
            const hasBeacon = cellContents && cellContents === "beacon";
            let messageText = "";
            let nextQueueItem;
            if (hasBeacon) {
                messageText = "Item found!";
                nextQueueItem = nextTrue;
            } else {
                messageText = "No item found!";
                nextQueueItem = nextFalse;
            }
            showMessage(messageText);
            nextQueueItem(true);
            // return next
            return next;
        });
    }

    function canMove(nextTrue, nextFalse) {
        actionQueue.push(function (next) {
            showMessage("Checking for wall...");
            // get the current location
            let x = jBot.getX();
            let y = jBot.getY();
            // get the current direction
            const z = jBot.getZ();
            // see if the next space is movable
            switch (z) {
                case 0:
                    y -= gridSize / cellCount;
                    break;
                case 0.5:
                    x += gridSize / cellCount;
                    break;
                case 1:
                    y += gridSize / cellCount;
                    break;
                case 1.5:
                    x -= gridSize / cellCount;
                    break;
            }
            const cellContents = spriteManager.getType(x, y);
            // output resuts
            const isBlocked = cellContents && cellContents === "wall";
            let messageText = "The space is ";
            let nextQueueItem;
            if (isBlocked) {
                nextQueueItem = nextFalse;
            } else {
                messageText = "not ";
                nextQueueItem = nextTrue;
            }
            messageText += "blocked!";
            showMessage(messageText);
            nextQueueItem(true);
            return next;
        });
    }

    function log(message) {
        actionQueue.push(function (next) {
            showMessage(message);
            next();
        });
    }

    // core methods
    function setAnimationFrame() {
        window.requestAnimationFrame = (function (callback) {
            return (
                window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                }
            );
        })();
    }

    function getCellSize() {
        return gridSize / cellCount;
    }

    function update() {
        jBot.update();
    }

    function draw() {
        canvasDraw.clear();
        // canvasDraw.grid();
        spriteManager.draw();
        jBot.draw();
    }

    function loop() {
        // Update
        update();

        // Draw
        draw();

        // Next loop
        window.requestAnimationFrame(loop);
    }

    // constructor
    (function () {
        let cellSize;

        actionQueue = [];
        commandInputElement = document.getElementById("userCode");
        outputElement = document.getElementById("output");
        timeout = 250;
        gridSize = document.getElementById("foreground").clientWidth;
        cellCount = 10;
        cellSize = getCellSize();

        canvasDraw = new Draw("foreground", cellSize);

        canvasElement = document.getElementById("foreground");
        canvasElement.onclick = canvasClickEvent;

        setAnimationFrame();

        spriteManager = new SpriteManager();

        createRandomMap();
        itemCount = 0;

        loop();
    })();
    // exposed methods
    return {
        run: run,
        clear: clear,
        setupButtonClicked: setupButtonClicked,
        reset: clearCode,
        rotate: rotate,
        listCommands: outputCommandList,
    };
})();
