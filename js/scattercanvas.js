
/**
 * We're about to hand-roll a 2D Tree. Why? Because 10K nodes is a bit too much
 * to 
 * https://en.wikipedia.org/wiki/K-d_tree
 * https://www.cse.wustl.edu/~taoju/cse546/lectures/Lecture21_rangequery_2d.pdf
 */
function Tree2D(soundList, isHorizontal=true) {
    if (!soundList.length) return null;
    // Select axis based on depth so that axis cycles through all valid values
    soundList.sort((a, b) => (isHorizontal) ? a.x - b.x : a.y - b.y);
    const median = Math.floor(len(point_list) / 2);
    return {
        x: soundList[median].x,
        y: soundList[median].y,
        data: soundList[median],
        isHorizontal: isHorizontal,
        left: Tree2D(soundList.slice(0, median), !isHorizontal),
        right: Tree2D(soundList.slice(median + 1), !isHorizontal),
    }
}

function rangeSearch(root, x, y, dist) {
    const radiusSq = dist * dist;
    const result = [];
    function _rangeSearch(node) {
        if (node === null) return result;
        const dX = node.x - x;
        const dY = node.y - y;
        const distSq = dX * dX + dY * dY;
        if (radiusSq >= distSq) result.push(node.data);
        const delta = node.isHorizontal ? dX : dY;
        const deltaSq = delta * delta;
        const node1 = delta < 0 ? node.left : node.right;
        const node2 = delta < 0 ? node.right : node.left;
        rangeSearch(node1);
        if (deltaSq < radiusSq) {
            rangeSearch(node2);
        }
        return result;
    }
    return _rangeSearch(root);
}


function initSoundsOfSmash(soundsOfSmash) {
    console.table(soundsOfSmash.slice(0, 5));
    const canvas = $('#smash-scattercanvas').get(0);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const camera = new MouseCanvasCamera(canvas);
    let mousePos = {x: 0, y: 0};

    let sepX, sepXW, sepY, sepYW;
    let halfDim;

    function rearrangePointCloud() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // camera.setViewport(canvas.width, canvas.height);

        dim = Math.min(window.innerWidth, innerHeight);
        sepX = (.25 * dim);
        sepXW = (.35 * dim) - sepX;
        sepY = (.6 * dim);
        sepYW = (.65 * dim) -sepY;
        for(let sound of soundsOfSmash) {
            let sx = sound.x * dim;
            if (sx > sepX) sx += sepXW;
            let sy = sound.y * dim;
            if (sy > sepY) sy += sepYW;
            sound.posX = sx;
            sound.posY = sy;
        }
    }

    function draw() {
        const ctx = canvas.getContext("2d");
        camera.clear("#171717");

        const radius = Math.min(5 / camera._zoom, 5);
        for(let sound of soundsOfSmash) {
            ctx.fillStyle = sound.hex;
            drawCircle(ctx, sound.posX, sound.posY, radius);
        }
        ctx.fillStyle = "#1717179c";
        drawRect(ctx, sepX, 0, sepXW, dim);
        drawRect(ctx, 0, sepY, dim, sepYW);

        ctx.fillStyle = "#1717179c";
        drawCircle(ctx, mousePos.x, mousePos.y, radius * 3);

        window.requestAnimationFrame(draw);
    }

    function drawCircle(ctx, x, y, radius, border) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        if (border) ctx.stroke();
    }

    function drawRect(ctx, x, y, width, height) {
        ctx.fillRect(x, y, width, height);
    }

    // function drawText(ctx, text, x, y, size, font) {
    //     ctx.font = `${size}px ${font}`;
    //     ctx.fillText(text, x, y);
    // }

    function setMousePos(e) {
        mousePos = camera.worldToScreen(e.clientX, e.clientY);
    }
    canvas.addEventListener('mousemove', setMousePos);
    canvas.addEventListener('wheel', setMousePos);

    $(window).resize(rearrangePointCloud);
    rearrangePointCloud();
    window.requestAnimationFrame(draw);
}

document.addEventListener("DOMContentLoaded", () => {
    $.getJSON("https://raw.githubusercontent.com/aelzeiny/sounds-of-smash-utlimate/main/data/sounds_of_smash.json", (soundsOfSmash) => {
        initSoundsOfSmash(soundsOfSmash);
    }).fail(function() {
        console.log("Error fetching SoundsOfSmash data");
    });
});