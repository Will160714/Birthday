// Global state
let images = [];
let revealedCount = 0;

// DOM Elements
const chestContainer = document.getElementById('chest-container');
const chest = document.getElementById('chest');
const heartContainer = document.getElementById('heart-container');
const heartSvg = document.getElementById('heart-svg');
const birthdayMessage = document.getElementById('birthday-message');
const hoverHint = document.getElementById('hover-hint');

// Load images from directory
async function loadImages() {
    // GitHub Pages compatible: hardcoded image list
    // Update this list with your actual image filenames
    const imageFilenames = [
        '0be86b93-8e69-4855-8afe-261e43dd9ae8.jpg',
        '315ee035-f56e-459d-9693-6c1aef4fd813.jpg',
        '4f1f605b-d5db-4e3a-a14c-519ec1cc26d1.jpg',
        '541965328_1191281079716326_5603222636066030120_n.jpg',
        '552763438_1504641397496741_1051608001197439662_n.jpg',
        '553353765_3422771624530428_5896904838621666528_n.jpg',
        '553583706_1778437216370390_4036940968075145664_n.jpg',
        '553643670_2566143633765789_5650850872996222218_n.jpg'
    ];

    images = imageFilenames.map(filename => ({
        path: `public/images/${filename}`,
        name: filename
    }));

    console.log('Loaded', images.length, 'images for GitHub Pages');
}

// Chest click handler
chest.addEventListener('click', handleChestClick);

async function handleChestClick() {
    chest.classList.add('opening');
    chest.style.pointerEvents = 'none';

    // Ensure images are loaded
    if (images.length === 0) {
        await loadImages();
    }

    // Wait for chest to open, then create and fly shards
    setTimeout(() => {
        createAndFlyShards();
    }, 800);
}

// Create shards and animate them
function createAndFlyShards() {
    chestContainer.style.display = 'none';
    heartContainer.classList.remove('hidden');

    // Change background to pink for petal view
    document.body.classList.add('petal-view');

    // Create glass gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(255,255,255,0.9);stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:rgba(200,230,255,0.7);stop-opacity:0.7" />
            <stop offset="100%" style="stop-color:rgba(255,255,255,0.9);stop-opacity:0.9" />
        </linearGradient>

        <filter id="glassBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
    `;
    heartSvg.appendChild(defs);

    // Calculate shard positions for heart shape
    const shardPositions = calculateHeartShardPositions(images.length);
    console.log('Creating', shardPositions.length, 'shards for heart');

    // Start position at center of SVG
    const startX = 250;
    const startY = 250;

    shardPositions.forEach((pos, index) => {
        createShard(pos, index, startX, startY);
    });

    // Add center heart image
    createCenterHeart();
}

// Create center heart image
function createCenterHeart() {
    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    heart.setAttribute('id', 'center-heart');
    heart.setAttribute('href', 'heart.png');
    heart.setAttribute('x', '125');
    heart.setAttribute('y', '125');
    heart.setAttribute('width', '250');
    heart.setAttribute('height', '250');
    heart.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    heart.style.opacity = '0';
    heart.style.transition = 'opacity 1s ease, transform 1s ease';
    heart.style.transformOrigin = 'center';
    heart.style.filter = 'drop-shadow(0 5px 20px rgba(255, 100, 100, 0.6))';
    heartSvg.appendChild(heart);
}

// Calculate positions for shards - simple circle to ensure all are visible
function calculateHeartShardPositions(count) {
    const positions = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 1; // Small circle for testing center alignment

    for (let i = 0; i < count; i++) {
        // Evenly distribute pieces in a circle
        const angle = (i / count) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Calculate rotation to make pieces point outward from center
        const rotation = (angle * 180 / Math.PI) + 90;

        positions.push({
            x: x,
            y: y,
            width: 70,
            height: 80,
            rotation: rotation,
            type: 'piece'
        });

        console.log(`Piece ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, rotation=${rotation.toFixed(1)}`);
    }

    console.log(`Created ${positions.length} positions - all pieces should be visible in viewport`);
    return positions;
}

// Create individual shard
function createShard(position, index, startX, startY) {
    console.log(`Creating shard ${index} at (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('shard');
    g.setAttribute('data-index', index);

    // Create heart piece shape
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = createHeartPiecePath(position);
    path.setAttribute('d', pathData);
    path.classList.add('glass-effect');
    path.setAttribute('data-index', index);

    // Create image element (hidden initially)
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', images[index]?.path || '');
    image.setAttribute('width', position.width);
    image.setAttribute('height', position.height);
    image.setAttribute('x', -position.width / 2);
    image.setAttribute('y', -position.height / 2);
    image.style.opacity = '0';
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // Create clip path for image
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', `clip-${index}`);
    const clipPathShape = path.cloneNode();
    clipPath.appendChild(clipPathShape);

    const defs = heartSvg.querySelector('defs');
    defs.appendChild(clipPath);
    image.setAttribute('clip-path', `url(#clip-${index})`);

    g.appendChild(image);
    g.appendChild(path);

    // Set initial scattered position (random explosion from chest)
    const explosionAngle = Math.random() * Math.PI * 2;
    const explosionDist = 80 + Math.random() * 120;
    const explosionX = startX + Math.cos(explosionAngle) * explosionDist;
    const explosionY = startY + Math.sin(explosionAngle) * explosionDist;

    g.setAttribute('transform', `translate(${explosionX}, ${explosionY}) rotate(${Math.random() * 720 - 360})`);
    g.style.opacity = '0';

    heartSvg.appendChild(g);

    // Fade in scattered pieces
    setTimeout(() => {
        g.style.transition = 'opacity 0.4s ease';
        g.style.opacity = '1';
    }, 200 + index * 50);

    // Animate to final heart position
    setTimeout(() => {
        g.style.transition = 'transform 2.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease';
        g.setAttribute('transform', `translate(${position.x}, ${position.y}) rotate(${position.rotation})`);

        // Add hover effect after animation completes
        setTimeout(() => {
            addShardHoverEffect(g, path, image, index);
        }, 2500);
    }, 800 + index * 150);
}

// Create heart piece path (petal-like shape)
function createHeartPiecePath(position) {
    const w = position.width;
    const h = position.height;

    // Create a petal/heart-like shape using cubic bezier curves
    return `M 0 ${-h/2}
            C ${w/2} ${-h/3}, ${w/2} ${h/4}, 0 ${h/2}
            C ${-w/2} ${h/4}, ${-w/2} ${-h/3}, 0 ${-h/2} Z`;
}

// Add hover effect to shard
function addShardHoverEffect(g, path, image, index) {
    g.style.cursor = 'pointer';
    let isRevealed = false;

    g.addEventListener('mouseenter', () => {
        if (!isRevealed) {
            // Create fullscreen image overlay
            const overlay = document.createElement('div');
            overlay.id = `overlay-${index}`;
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            overlay.style.zIndex = '10000';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease';

            const fullImage = document.createElement('img');
            fullImage.src = images[index]?.path || '';
            fullImage.style.maxWidth = '90%';
            fullImage.style.maxHeight = '90%';
            fullImage.style.objectFit = 'contain';
            fullImage.style.borderRadius = '10px';
            fullImage.style.boxShadow = '0 0 50px rgba(255, 215, 0, 0.5)';

            overlay.appendChild(fullImage);
            document.body.appendChild(overlay);

            // Fade in overlay
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);

            // After 1 second, remove overlay and reveal petal
            setTimeout(() => {
                // Fade out overlay
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 500);

                // Permanently reveal the petal
                isRevealed = true;
                g.classList.add('revealed');
                g.style.cursor = 'default';

                // Fade out glass, fade in image in petal
                path.style.transition = 'opacity 0.8s ease';
                path.style.opacity = '0';
                image.style.transition = 'opacity 0.8s ease';
                image.style.opacity = '1';

                // Update reveal count
                revealedCount++;
                updateHeartReveal();

                // Check if all revealed
                if (revealedCount === images.length) {
                    setTimeout(() => {
                        showBirthdayMessage();
                    }, 1000);
                }
            }, 1000);
        }
    });
}

// Update the center heart reveal based on hover count
function updateHeartReveal() {
    const centerHeart = document.getElementById('center-heart');
    if (centerHeart) {
        const revealPercentage = (revealedCount / images.length) * 100;
        centerHeart.style.opacity = revealPercentage / 100;
        const scale = 0.5 + (revealPercentage / 200);
        centerHeart.setAttribute('transform', `scale(${scale})`);
    }

    // Hide hint once user starts revealing
    if (revealedCount > 0 && hoverHint) {
        hoverHint.style.opacity = '0';
        hoverHint.classList.remove('visible');
        hoverHint.style.display = 'none';
    }
}

// Play reveal sound (placeholder)
function playRevealSound() {
    // Could add actual audio here
    // const audio = new Audio('reveal.mp3');
    // audio.play();
}

// Show birthday message
function showBirthdayMessage() {
    // Show birthday text at the top
    birthdayMessage.classList.remove('hidden');

    // Move heart container down to make room for text, but keep it centered
    heartContainer.style.top = '55%';
    heartContainer.style.transform = 'translateY(-50%)';

    // Shrink the circle by scaling down the SVG
    heartSvg.style.transition = 'transform 1s ease';
    heartSvg.style.transform = 'scale(0.7)';

    createConfetti();
}

// Create confetti animation
function createConfetti() {
    const container = document.querySelector('.confetti-container');
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }

    // Continue creating confetti
    setInterval(() => {
        for (let i = 0; i < 5; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }
    }, 500);
}

// Initialize - load images and show chest on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadImages();
});

// Show hint when user starts moving mouse
let hasMovedMouse = false;
document.addEventListener('mousemove', () => {
    if (!hasMovedMouse && hoverHint && revealedCount === 0) {
        hasMovedMouse = true;
        hoverHint.classList.add('visible');
        hoverHint.style.opacity = '1';

        // Hide hint after 5 seconds
        setTimeout(() => {
            if (revealedCount === 0) {
                hoverHint.style.opacity = '0';
                hoverHint.classList.remove('visible');
            }
        }, 5000);
    }
});