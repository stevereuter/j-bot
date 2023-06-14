/** @format */

function SpriteManager() {
    // private
    const sprites = [];

    // methods
    function getId(x, y) {
        let id;
        const padding = '000';

        id = (padding + x).slice(-padding.length);
        id += (padding + y).slice(-padding.length);

        return id;
    }

    function draw() {
        for (let id in sprites) {
            if (sprites[id]) {
                sprites[id].draw();
            }
        }
    }

    function remove(x, y) {
        const id = getId(x, y);
        sprites[id] = undefined;
    }

    function add(x, y, sprite) {
        const id = getId(x, y);
        sprites[id] = sprite;
    }

    function isBlocked(x, y) {
        const id = getId(x, y);
        const sprite = sprites[id];

        return sprite && sprite.getName() === 'wall';
    }

    function getType(x, y) {
        const id = getId(x, y);
        const sprite = sprites[id];
        if (sprite) {
            return sprite.getName();
        }
        return undefined;
    }

    function getSprites(name) {
        const returnSprites = [];
        if (name) {
            for (var id in sprites) {
                if (sprites.hasOwnProperty(id)) {
                    var s = sprites[id];
                    if (s && s.getName() === name) returnSprites.push(s);
                }
            }

            return returnSprites;
        } else {
            for (var id in sprites) {
                if (sprites.hasOwnProperty(id)) {
                    var s = sprites[id];
                    if (s) returnSprites.push(s);
                }
            }
        }

        return returnSprites;
    }

    // exposted
    return {
        add: add,
        draw: draw,
        getType: getType,
        isBlocked: isBlocked,
        remove: remove,
        getSprites: getSprites,
    };
}
