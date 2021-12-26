
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


class PlayerManager {
    static MAX_AUDIO = 10;
    static PAUSE_TIME = 2000;

    constructor() {
        this.nowPlaying = {};
        this.cache = {};
        this.onPause = new Set();
    }

    play(audioSrc) {
        if (this.nowPlaying.size >= PlayerManager.MAX_AUDIO || audioSrc in this.nowPlaying || this.onPause.has(audioSrc)) {
            return;
        } else {
            if (!(audioSrc in this.cache)) {
                this.cache[audioSrc] = new Audio(this.fileToUrl(audioSrc));
                this.cache[audioSrc].load();
            }
            this.nowPlaying[audioSrc] = this.cache[audioSrc];
            this.onPause.add(audioSrc);
            this.nowPlaying[audioSrc].play();
        }
    }

    update() {
        const toRemove = [];
        for (let audioSrc in this.nowPlaying) {
            if (this.nowPlaying[audioSrc].ended) {
                toRemove.push(audioSrc);
            }
        }
        for (let audioSrc of toRemove) {
            delete this.nowPlaying[audioSrc];
            setTimeout(() => this.onPause.delete(audioSrc), PlayerManager.PAUSE_TIME);
        }
    }

    fileToUrl(audioSrc) {
        return 'https://f004.backblazeb2.com/file/sounds-of-smash/' + audioSrc;
    }
}


function initSoundsOfSmash(soundsOfSmash) {
    console.table(soundsOfSmash.slice(0, 5));
    const canvas = $('#smash-scattercanvas').get(0);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const camera = new MouseCanvasCamera(canvas);
    const player = new PlayerManager();
    camera.setZoom(0.8);
    let mousePos = {x: 0, y: 0};

    let sepX, sepXW, sepY, sepYW;

    function rearrangePointCloud() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        dim = Math.min(window.innerWidth, innerHeight);
        sepX = (.25 * dim);
        sepXW = (.35 * dim) - sepX;
        sepY = (.6 * dim);
        sepYW = (.65 * dim) - sepY;
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
        const ctx = canvas.getContext('2d');
        camera.updateCanvas(ctx);
        player.update();
        camera.clear(ctx, "#171717", canvas.width, canvas.height);

        const radius = Math.min(5 / camera._zoom, 5);
        const mouseRadius = radius * 3;
        const mouseRadiusSq = mouseRadius * mouseRadius;
        for(let sound of soundsOfSmash) {
            const deltaX = (sound.posX - mousePos.x);
            const deltaY = (sound.posY - mousePos.y);
            const distSq = deltaX * deltaX + deltaY * deltaY;
            if (distSq < mouseRadiusSq) {
                player.play(sound.file);
                ctx.fillStyle = 'white';
                drawCircle(ctx, sound.posX, sound.posY, radius);
            } else {
                ctx.fillStyle = sound.hex;
                drawCircle(ctx, sound.posX, sound.posY, radius);
            }
        }
        // if (inRange.length)
        //     console.table(inRange);
        ctx.fillStyle = "#1717179c";
        drawRect(ctx, sepX, 0, sepXW, dim);
        drawRect(ctx, 0, sepY, dim, sepYW);

        // ctx.fillStyle = "#1717179c";
        // drawCircle(ctx, mousePos.x, mousePos.y, mouseRadius);

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

$('#start-btn').click(() => {
    $('#headphone-warning').addClass('hidden');
    $.getJSON("https://raw.githubusercontent.com/aelzeiny/sounds-of-smash-utlimate/main/data/sounds_of_smash.json", (soundsOfSmash) => {
        initSoundsOfSmash(soundsOfSmash);
    }).fail(function() {
        alert("Error fetching SoundsOfSmash data.");
    });
});