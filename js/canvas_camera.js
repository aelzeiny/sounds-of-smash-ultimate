/**
 * Adapted from https://codepen.io/chengarda/pen/wRxoyB
 */
class CanvasCamera {
    static MIN_ZOOM = 0.75;
    static MAX_ZOOM = 5;
    static SCROLL_SENSITIVITY = 0.001;

    constructor(canvas) {
        this.cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.cameraZoom = 1;

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.update = this.update.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handlePinch = this.handlePinch.bind(this);
        this.adjustZoom = this.adjustZoom.bind(this);

        canvas.addEventListener('mousedown', this.onPointerDown);
        canvas.addEventListener('touchstart', (e) => this.handleTouch(e, this.onPointerDown));
        canvas.addEventListener('mouseup', this.onPointerUp);
        canvas.addEventListener('touchend', (e) => this.handleTouch(e, this.onPointerUp));
        canvas.addEventListener('mousemove', this.onPointerMove);
        canvas.addEventListener('touchmove', (e) => this.handleTouch(e, this.onPointerMove));
        canvas.addEventListener('wheel', (e) => this.adjustZoom(e.deltaY * CanvasCamera.SCROLL_SENSITIVITY));

        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        this.initialPinchDistance = null;
        this.lastZoom = this.cameraZoom;
    }

    getEventLocation(e) {
        if (e.touches && e.touches.length == 1) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.clientX && e.clientY) {
            return { x: e.clientX, y: e.clientY };
        }
    }

    // Gets the relevant location from a mouse or single touch event
    onPointerDown(e) {
        this.isDragging = true
        this.dragStart.x = this.getEventLocation(e).x / this.cameraZoom - this.cameraOffset.x;
        this.dragStart.y = this.getEventLocation(e).y / this.cameraZoom - this.cameraOffset.y;
    }

    onPointerUp() {
        this.isDragging = false;
        this.initialPinchDistance = null;
        this.lastZoom = this.cameraZoom;
    }

    onPointerMove(e) {
        if (this.isDragging) {
            this.cameraOffset.x = this.getEventLocation(e).x / this.cameraZoom - this.dragStart.x;
            this.cameraOffset.y = this.getEventLocation(e).y / this.cameraZoom - this.dragStart.y;
        }
    }

    update(ctx) {
        // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
        ctx.resetTransform();
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        ctx.scale(this.cameraZoom, this.cameraZoom);
        ctx.translate(-window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y);
    }

    clear(context, color) {
        const ul = this.screen2World(0, 0);
        const lr = this.screen2World(window.innerWidth, window.innerHeight);
        if (!color) {
            context.clearRect(ul.x, ul.y, (lr.x - ul.x), (lr.y - ul.y));
        } else {
            context.fillStyle = color;
            context.fillRect(ul.x, ul.y, (lr.x - ul.x), (lr.y - ul.y));
        }
    }

    handleTouch(e, singleTouchHandler) {
        if (e.touches.length == 1) {
            singleTouchHandler(e);
        } else if (e.type == "touchmove" && e.touches.length == 2) {
            this.isDragging = false;
            this.handlePinch(e);
        }
    }

    handlePinch(e) {
        e.preventDefault();

        let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

        // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
        let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

        if (this.initialPinchDistance == null) {
            this.initialPinchDistance = currentDistance;
        } else {
            this.adjustZoom(null, currentDistance / this.initialPinchDistance);
        }
    }

    adjustZoom(zoomAmount, zoomFactor) {
        if (!this.isDragging) {
            if (zoomAmount) {
                this.cameraZoom += zoomAmount;
            } else if (zoomFactor) {
                this.cameraZoom = zoomFactor * this.lastZoom;
            }

            this.cameraZoom = Math.min(this.cameraZoom, CanvasCamera.MAX_ZOOM);
            this.cameraZoom = Math.max(this.cameraZoom, CanvasCamera.MIN_ZOOM);
        }
    }

    screen2World(worldX, worldY) {
        return {
            x: (worldX - this.cameraOffset.x) / this.cameraZoom - (-window.innerWidth / 2 + this.cameraOffset.x) + (-window.innerWidth / 2 + this.cameraOffset.x) / this.cameraZoom,
            y: (worldY - this.cameraOffset.y) / this.cameraZoom - (-window.innerHeight / 2 + this.cameraOffset.y) + (-window.innerHeight / 2 + this.cameraOffset.y) / this.cameraZoom
        }
    }
}