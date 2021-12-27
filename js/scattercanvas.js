class PlayerManager {
    static MAX_AUDIO = 5;
    static PAUSE_TIME = 2000;
    static REGEX_UNDERSCORE = new RegExp(/[( / )|\s]/g);

    constructor() {
        this.nowPlaying = new Map();
        this.cache = {};
        this.onPause = new Set();
    }

    play(audioSrc) {
        if (audioSrc in this.nowPlaying || this.onPause.has(audioSrc) || this.nowPlaying.size >= PlayerManager.MAX_AUDIO)
            return;
        if (!(audioSrc in this.cache)) {
            this.cache[audioSrc] = new Audio(this.fileToUrl(audioSrc));
            this.cache[audioSrc].load();
        }
        this.nowPlaying.set(audioSrc, this.cache[audioSrc]);
        this.nowPlaying.get(audioSrc).play().catch((e) => {
            this.nowPlaying.delete(audioSrc);
            console.error('Unable to play Smash Audio File. ' + e.toString());
        });
    }

    update() {
        const toRemove = [];
        for (let [audioSrc, audioMedia] of this.nowPlaying.entries()) {
            if (audioMedia.ended) {
                toRemove.push(audioSrc);
            }
        }
        for (let audioSrc of toRemove) {
            this.nowPlaying.delete(audioSrc);
            this.onPause.add(audioSrc);
            setTimeout(() => this.onPause.delete(audioSrc), PlayerManager.PAUSE_TIME);
        }
    }

    fileToUrl(audioSrc) {
        return 'https://f004.backblazeb2.com/file/sounds-of-smash/' + audioSrc;
    }

    charToImg(char) {
        const formattedChar = char.toLowerCase()
            .replaceAll(PlayerManager.REGEX_UNDERSCORE, '_')
            .replaceAll('&', 'and')
            .replaceAll('.', '');
        return 'https://f004.backblazeb2.com/file/sounds-of-smash/pics/' + formattedChar + '.png';
    }
}


function initSoundsOfSmash(soundsOfSmash) {
    const canvas = $('#smash-scattercanvas').get(0);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const camera = new MouseCanvasCamera(canvas);
    const player = new PlayerManager();
    camera.setZoom(0.8);
    let mousePos = { x: 0, y: 0 };

    let sepX, sepXW, sepY, sepYW;

    function rearrangePointCloud(center = false) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        dim = Math.min(window.innerWidth, innerHeight);
        sepX = (.25 * dim);
        sepXW = (.35 * dim) - sepX;
        sepY = (.6 * dim);
        sepYW = (.65 * dim) - sepY;
        let minX, maxX, minY, maxY;
        for (let sound of Object.values(soundsOfSmash)) {
            let sx = sound.x * dim;
            if (sx > sepX) sx += sepXW;
            let sy = sound.y * dim;
            if (sy > sepY) sy += sepYW;
            if (minX === undefined || sx < minX)
                minX = sx;
            if (maxX === undefined || sx > maxX)
                maxX = sx;
            if (minY === undefined || sy < minY)
                minY = sy;
            if (maxY === undefined || sy > maxY)
                maxY = sy;
            sound.posX = sx;
            sound.posY = sy;
        }
        if (center) {
            const currCenter = { x: (maxX + minX) / 2, y: (maxY + minY) / 2 };
            const targetCenter = camera.worldToScreen((window.innerWidth - 300) / 2, (window.innerHeight) / 2);
            camera.setPosition(
                camera._position.x + (targetCenter.x - currCenter.x),
                camera._position.y + (targetCenter.y - currCenter.y)
            );
        }
    }

    function draw() {
        const ctx = canvas.getContext('2d');
        camera.updateCanvas(ctx);
        player.update();
        camera.clear(ctx, "#0e1117", canvas.width, canvas.height);

        const radius = Math.min(5 / camera._zoom, 5);
        const mouseRadius = radius * 3;
        const mouseRadiusSq = mouseRadius * mouseRadius;
        for (let sound of Object.values(soundsOfSmash)) {
            if (!(sound.enabledChar && sound.enabledType)) {
                continue;
            }
            const deltaX = (sound.posX - mousePos.x);
            const deltaY = (sound.posY - mousePos.y);
            const distSq = deltaX * deltaX + deltaY * deltaY;
            if (distSq < mouseRadiusSq) {
                player.play(sound.file);
            }
            ctx.fillStyle = sound.hex;
            drawCircle(ctx, sound.posX, sound.posY, radius);
        }
        for (let [fileKey, _] of player.nowPlaying) {
            const sound = soundsOfSmash[fileKey];
            ctx.fillStyle = 'white';
            drawCircle(ctx, sound.posX, sound.posY, radius);
        }
        ctx.fillStyle = "#0e11179c";
        drawRect(ctx, sepX, 0, sepXW, dim);
        drawRect(ctx, 0, sepY, dim, sepYW);

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
    rearrangePointCloud(true);
    window.requestAnimationFrame(draw);
}