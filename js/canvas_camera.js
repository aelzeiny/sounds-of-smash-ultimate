/**
 * https://github.com/ManojLakshan/monogame/blob/master/MonoGame.Framework/Matrix4D.cs
 */
class Matrix4D {
    constructor(m) {
        this.m11 = m.m11 || 0;
        this.m12 = m.m12 || 0;
        this.m13 = m.m13 || 0;
        this.m14 = m.m14 || 0;
        this.m21 = m.m21 || 0;
        this.m22 = m.m22 || 0;
        this.m23 = m.m23 || 0;
        this.m24 = m.m24 || 0;
        this.m31 = m.m31 || 0;
        this.m32 = m.m32 || 0;
        this.m33 = m.m33 || 0;
        this.m34 = m.m34 || 0;
        this.m41 = m.m41 || 0;
        this.m42 = m.m42 || 0;
        this.m43 = m.m43 || 0;
        this.m44 = m.m44 || 0;
    }

    mult(other) {
        return new Matrix4D({
            m11: this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31 + this.m14 * other.m41,
            m12: this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32 + this.m14 * other.m42,
            m13: this.m11 * other.m13 + this.m12 * other.m23 + this.m13 * other.m33 + this.m14 * other.m43,
            m14: this.m11 * other.m14 + this.m12 * other.m24 + this.m13 * other.m34 + this.m14 * other.m44,
            m21: this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31 + this.m24 * other.m41,
            m22: this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32 + this.m24 * other.m42,
            m23: this.m21 * other.m13 + this.m22 * other.m23 + this.m23 * other.m33 + this.m24 * other.m43,
            m24: this.m21 * other.m14 + this.m22 * other.m24 + this.m23 * other.m34 + this.m24 * other.m44,
            m31: this.m31 * other.m11 + this.m32 * other.m21 + this.m33 * other.m31 + this.m34 * other.m41,
            m32: this.m31 * other.m12 + this.m32 * other.m22 + this.m33 * other.m32 + this.m34 * other.m42,
            m33: this.m31 * other.m13 + this.m32 * other.m23 + this.m33 * other.m33 + this.m34 * other.m43,
            m34: this.m31 * other.m14 + this.m32 * other.m24 + this.m33 * other.m34 + this.m34 * other.m44,
            m41: this.m41 * other.m11 + this.m42 * other.m21 + this.m43 * other.m31 + this.m44 * other.m41,
            m42: this.m41 * other.m12 + this.m42 * other.m22 + this.m43 * other.m32 + this.m44 * other.m42,
            m43: this.m41 * other.m13 + this.m42 * other.m23 + this.m43 * other.m33 + this.m44 * other.m43,
            m44: this.m41 * other.m14 + this.m42 * other.m24 + this.m43 * other.m34 + this.m44 * other.m44,
        });
    }

    /**
     * https://github.com/ManojLakshan/monogame/blob/master/MonoGame.Framework/Vector2.cs#L413
     */
    transformVector2(x, y) {
        return {
            x: (x * this.m11) + (y * this.m21) + this.m41,
            y: (x * this.m12) + (y * this.m22) + this.m42,
        }
    }

    static fromTranslation(x, y, z) {
        const m = Matrix4D.identity();
        m.m41 = x;
        m.m42 = y;
        m.m43 = z;
        return m;
    }

    static fromRotationZ(radians) {
        const m = Matrix4D.identity();
        m.m11 = Math.cos(radians);
        m.m12 = Math.sin(radians);
        m.m21 = -m.m12;
        m.m22 = m.m11;
        return m;
    }

    static fromScale(xScale, yScale, zScale) {
        return new Matrix4D({
            m11: xScale,
            m22: yScale,
            m33: zScale,
            m44: 1,
        });
    }

    static identity() {
        return new Matrix4D({m11: 1, m22: 1, m33: 1, m44: 1});
    }
}

class CanvasCamera {
    constructor(canvas) {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
        this._context.save();
        this._viewportWidth = canvas.width;
        this._viewportHeight = canvas.height;
        this._position = {x: 0, y: 0};
        this._zoom = 1;
        this._rotation = 0;
        
        this.updateTranslationMatrix();
    }

    clear(color) {
        const ul = this.worldToScreen(0, 0);
        const lr = this.worldToScreen(this._viewportWidth, this._viewportHeight);
        if (!color) {
            this._context.clearRect(ul.x, ul.y, (lr.x - ul.x), (lr.y - ul.y));
        } else {
            this._context.fillStyle = color;
            this._context.fillRect(ul.x, ul.y, (lr.x - ul.x), (lr.y - ul.y));
        }
    }

    worldToScreen(x, y) {
        return this._translationMatrix.transformVector2(x, y);
    }

    updateTranslationMatrix(updateCanvas=true) {
        this._translationMatrix = Matrix4D.fromTranslation(-this._position.x, -this._position.y, 0)
            .mult(Matrix4D.fromRotationZ(this._rotation))
            .mult(Matrix4D.fromScale(1 / this._zoom, 1 / this._zoom, 1));

        if (updateCanvas) {
            this._context.setTransform(
                this._zoom, 
                0, 
                0, 
                this._zoom, 
                this._position.x,
                this._position.y,
            );
        }
    }

    setZoom(zoom, updateTransforms=true, updateCanvas=true) {
        this._zoom = zoom;
        if (updateTransforms) this.updateTranslationMatrix(updateCanvas);
    }

    setPosition(x, y, updateTransforms=true, updateCanvas=true) {
        this._position.x = x;
        this._position.y = y;
        if (updateTransforms) this.updateTranslationMatrix(updateCanvas);
    }

    setRotation(radians, updateTransforms=true, updateCanvas=true) {
        this._rotation = radians;
        if (updateTransforms) this.updateTranslationMatrix(updateCanvas);
    }

    setViewport(vw, vh, updateTransforms=true, updateCanvas=true) {
        this._viewportWidth = vw;
        this._viewportHeight = vh;
        if (updateTransforms) this.updateTranslationMatrix(updateCanvas);
    }
}


/**
 * Adapted from https://codepen.io/chengarda/pen/wRxoyB
 */
class MouseCanvasCamera extends CanvasCamera {
    static MIN_ZOOM = .75;
    static MAX_ZOOM = 5;
    static SCROLL_SENSITIVITY = 0.001;

    constructor(canvas) {
        super(canvas);
        
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handlePinch = this.handlePinch.bind(this);
        this.adjustZoom = this.adjustZoom.bind(this);
        this.handleWheel = this.handleWheel.bind(this);

        canvas.addEventListener('mousedown', this.onPointerDown);
        canvas.addEventListener('touchstart', (e) => this.handleTouch(e, this.onPointerDown));
        canvas.addEventListener('mouseup', this.onPointerUp);
        canvas.addEventListener('touchend', (e) => this.handleTouch(e, this.onPointerUp));
        canvas.addEventListener('mousemove', this.onPointerMove);
        canvas.addEventListener('touchmove', (e) => this.handleTouch(e, this.onPointerMove));
        canvas.addEventListener('wheel', this.handleWheel);

        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        this.initialPinchDistance = null;
        this.lastZoom = this._zoom;

        this.initialZoomMouse = null;
    }
    
    getEventLocation(e) {
        if (e && e.touches && e.touches.length == 1) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        else if (e && e.clientX && e.clientY) {
            return { x: e.clientX, y: e.clientY };
        }
    }

    // Gets the relevant location from a mouse or single touch event
    onPointerDown(e) {
        this.isDragging = true
        const mouse = this.getEventLocation(e);
        if (mouse)
            this.dragStart = this.worldToScreen(mouse.x, mouse.y);
    }

    onPointerUp() {
        this.isDragging = false;
        this.initialPinchDistance = null;
        this.lastZoom = this._zoom;
    }

    onPointerMove(e) {
        if (this.isDragging) {
            const mouseWorld = this.getEventLocation(e);
            if (mouseWorld) {
                const mouse = this.worldToScreen(mouseWorld.x, mouseWorld.y);
                this.setPosition(
                    this._position.x + mouse.x - this.dragStart.x,
                    this._position.y + mouse.y - this.dragStart.y
                );
            }
        }
    }
    
    handleTouch(e, singleTouchHandler) {
        if (e.touches.length == 1) {
            singleTouchHandler(e);
        }
        else if (e.type == "touchmove" && e.touches.length == 2) {
            this.isDragging = false;
            handlePinch(e);
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
        }
        else {
            adjustZoom(null, currentDistance / this.initialPinchDistance);
        }
    }

    handleWheel(e) {
        e.preventDefault();
        if (!this.isDragging) {
            const mouseWorld = this.getEventLocation(e);
            if (!mouseWorld) return;

            const mouseBefore = this.worldToScreen(mouseWorld.x, mouseWorld.y);
            this.adjustZoom(e.deltaY * MouseCanvasCamera.SCROLL_SENSITIVITY, null, false);
            const mouseAfter = this.worldToScreen(mouseWorld.x, mouseWorld.y);

            this.setPosition(
                this._position.x + (mouseAfter.x - mouseBefore.x),
                this._position.y + (mouseAfter.y - mouseBefore.y),
                true,
                true
            );
        }
    }

    adjustZoom(zoomAmount, zoomFactor, updateCanvas=true) {
        if (!this.isDragging) {
            if (zoomAmount) {
                this.setZoom(this._zoom + zoomAmount, false, false);
            }
            else if (zoomFactor) {
                this.setZoom(zoomFactor * this.lastZoom, false, false);
            }

            this.setZoom(
                Math.max(Math.min(this._zoom, MouseCanvasCamera.MAX_ZOOM), MouseCanvasCamera.MIN_ZOOM),
                true,
                updateCanvas
            );
        }
    }
}