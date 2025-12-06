function generateStainedGlassSeedReveal(canvas, options = {}) {
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    const numSeeds = options.seeds || 120;
    const borderThreshold = options.borderThreshold || 3;
    const palette = options.palette || [
        "#003f8a",
        "#8b0015",
        "#2e6e3d",
        "#d4a017",
        "#4e2f70"
    ];

    const seeds = [];
    for (let i = 0; i < numSeeds; i++) {
        seeds.push({
            x: Math.random() * width,
            y: Math.random() * height,
            color: palette[Math.floor(Math.random() * palette.length)]
        });
    }

    function dist2(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return dx * dx + dy * dy;
    }

    const pixelSeed = new Array(width * height);
    const pixelDist = new Array(width * height);
    const pixelSecondDist = new Array(width * height);

    let maxDist = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            let closest = null;
            let second = null;

            for (let s of seeds) {
                const d = dist2(x, y, s.x, s.y);

                if (closest === null || d < closest.d) {
                    second = closest;
                    closest = { d, seed: s };
                } else if (second === null || d < second.d) {
                    second = { d, seed: s };
                }
            }

            const idx = y * width + x;
            pixelSeed[idx] = closest.seed;
            pixelDist[idx] = Math.sqrt(closest.d);
            pixelSecondDist[idx] = Math.sqrt(second.d);

            if (pixelDist[idx] > maxDist) maxDist = pixelDist[idx];
        }
    }

    let revealRadius = 0;
    const revealSpeed = options.speed || 1.8;

    function animate() {
        const img = ctx.createImageData(width, height);
        const buf = img.data;

        for (let i = 0; i < pixelSeed.length; i++) {
            const d = pixelDist[i];

            const px = i % width;
            const py = (i / width) | 0;
            const index = i * 4;

            if (d > revealRadius) {
                buf[index] = buf[index + 1] = buf[index + 2] = 0;
                buf[index + 3] = 255;
                continue;
            }

            const isBorder =
                Math.abs(d - pixelSecondDist[i]) < borderThreshold;

            if (isBorder) {
                buf[index] = buf[index + 1] = buf[index + 2] = 20;
                buf[index + 3] = 255;
                continue;
            }

            const col = pixelSeed[i].color;
            buf[index] = parseInt(col.slice(1, 3), 16);
            buf[index + 1] = parseInt(col.slice(3, 5), 16);
            buf[index + 2] = parseInt(col.slice(5, 7), 16);
            buf[index + 3] = 255;
        }

        ctx.putImageData(img, 0, 0);

        revealRadius += revealSpeed;

        if (revealRadius < maxDist) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

const canvas = document.getElementById("glass-bg");

function resize() {
    const hero = document.querySelector('.hero');
    canvas.width = hero.clientWidth;
    canvas.height = hero.clientHeight;
}

resize();

generateStainedGlassSeedReveal(canvas, {
    seeds: 500,
    borderThreshold: 2.0,
    speed: 1.4
});

window.addEventListener("resize", () => {
    resize();
    generateStainedGlassSeedReveal(canvas);
});
