/**
 * Minimal polyfills for browser geometry APIs that pdfjs-dist v5 references
 * at module load time. These are only needed for the module to initialize —
 * actual matrix/point/rect operations are not used during text extraction.
 *
 * This avoids pulling in @napi-rs/canvas (which has native bindings that
 * break Turbopack and don't ship correctly on Vercel).
 */

if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    is2D = true;
    isIdentity = true;

    constructor(init?: any) {
      if (Array.isArray(init) && init.length === 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        this.m11 = this.a; this.m12 = this.b;
        this.m21 = this.c; this.m22 = this.d;
        this.m41 = this.e; this.m42 = this.f;
      }
    }

    inverse() { return new (globalThis as any).DOMMatrix(); }
    multiply() { return new (globalThis as any).DOMMatrix(); }
    translate() { return new (globalThis as any).DOMMatrix(); }
    scale() { return new (globalThis as any).DOMMatrix(); }
    rotate() { return new (globalThis as any).DOMMatrix(); }
    transformPoint(p: any = {}) { return { x: p.x || 0, y: p.y || 0, z: p.z || 0, w: p.w || 1 }; }

    static fromMatrix() { return new (globalThis as any).DOMMatrix(); }
    static fromFloat32Array() { return new (globalThis as any).DOMMatrix(); }
    static fromFloat64Array() { return new (globalThis as any).DOMMatrix(); }
  };
}

if (typeof globalThis.DOMPoint === 'undefined') {
  (globalThis as any).DOMPoint = class DOMPoint {
    x: number; y: number; z: number; w: number;
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
    static fromPoint(p: any = {}) { return new (globalThis as any).DOMPoint(p.x, p.y, p.z, p.w); }
  };
}

if (typeof globalThis.DOMRect === 'undefined') {
  (globalThis as any).DOMRect = class DOMRect {
    x: number; y: number; width: number; height: number;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x; this.y = y; this.width = width; this.height = height;
    }
    get top() { return this.y; }
    get left() { return this.x; }
    get bottom() { return this.y + this.height; }
    get right() { return this.x + this.width; }
    static fromRect(r: any = {}) { return new (globalThis as any).DOMRect(r.x, r.y, r.width, r.height); }
  };
}

if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(sw: number, sh: number);
    constructor(data: Uint8ClampedArray, sw: number, sh?: number);
    constructor(dataOrWidth: any, shOrWidth: number, sh?: number) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = shOrWidth;
        this.height = sh ?? (dataOrWidth.length / (shOrWidth * 4));
      } else {
        this.width = dataOrWidth;
        this.height = shOrWidth;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      }
    }
  };
}

if (typeof globalThis.Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {
    constructor(_path?: string | Path2D) {}
    addPath() {}
    closePath() {}
    moveTo() {}
    lineTo() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
    arc() {}
    arcTo() {}
    ellipse() {}
    rect() {}
  };
}
