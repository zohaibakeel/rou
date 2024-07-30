// DOM elements
const balanceElement = document.getElementById('balanceAmount');
const resultDisplay = document.querySelector('.result');
const headerLight = document.getElementById('headerLight');
const outputPaper = document.querySelector('.output-paper');
const betInput = document.getElementById('betAmount');

// Canvas setup
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');

// Colors and multipliers
const colors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#7FFF00', '#00FFFF',
    '#0000FF', '#8A2BE2', '#FF00FF', '#FF1493', '#000000'
];
const multipliers = [0.1, 0.2, 0.0, 0.4, 0.5, 0.0, 2.0, 0.8, 0.0, 0.0];
const displayMultipliers = [0.4, 0.5, 0.0, 2.0, 0.8, 0.0, 0.0, 0.1, 0.2, 0.0];

let balance = 0;
let currentAngle = 0;

// Function to update the displayed balance
function updateBalanceDisplay() {
    balanceElement.textContent = `$${balance.toFixed(2)}`;
}

// Function to draw the roulette wheel
function drawRouletteWheel() {
    const radius = canvas.width / 2;
    const arcSize = (2 * Math.PI) / colors.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    colors.forEach((color, index) => {
        const startAngle = index * arcSize;
        const endAngle = (index + 1) * arcSize;

        // Draw the segment
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Calculate the position for the text
        const textAngle = startAngle + arcSize / 2;
        const textX = radius + Math.cos(textAngle) * (radius * 0.5);
        const textY = radius + Math.sin(textAngle) * (radius * 0.5);

        // Draw the multiplier text (using displayMultipliers)
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFFFFF"; // White text for contrast
        ctx.font = "bold 16px Arial";
        ctx.fillText(`x${displayMultipliers[index].toFixed(1)}`, 0, 0);
        ctx.restore();
    });
}

// Function to spin the wheel
function spinWheel() {
    const betAmount = parseFloat(betInput.value);

    // Check if the bet amount is valid
    if (isNaN(betAmount) || betAmount <= 0) {
        resultDisplay.innerHTML = "Please enter a valid bet amount!";
        outputPaper.classList.add('show');
        outputPaper.classList.add('lose');
        return;
    }

    // Check if the user has enough balance
    if (balance < betAmount) {
        resultDisplay.innerHTML = "Insufficient balance!";
        outputPaper.classList.add('show');
        outputPaper.classList.add('lose');
        return;
    }

    const spinSound = document.getElementById('spinSound');
    spinSound.play();
    spinSound.currentTime = 0; // Restart the sound if it's already playing

    const colorsCount = colors.length;
    const arcSize = 360 / colorsCount; // Angle of each segment
    const spinDuration = 5000; // 5 seconds
    const startTime = Date.now();

    // Random final angle between 0 and 360 degrees
    const finalAngle = Math.floor(Math.random() * 360);

    // Total rotation including multiple spins plus final stopping point
    const totalRotation = 360 * 10 + finalAngle;

    function rotate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);

        // Use an easing function to simulate slowing down
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = totalRotation * easeOut;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(currentAngle * Math.PI / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawRouletteWheel();
        ctx.restore();

        if (progress < 1) {
            requestAnimationFrame(rotate);
        } else {
            // Correct the angle for the pin position
            const stoppingAngle = (totalRotation % 360);
            const adjustedAngle = (360 - stoppingAngle + arcSize / 2) % 360; // Adjust by half an arc size
            const index = Math.floor(adjustedAngle / arcSize) % colorsCount;

            const multiplier = multipliers[index];
            const win = multiplier > 0;

            if (win) {
                balance += betAmount * multiplier;
                resultDisplay.innerHTML = `🎉 You win!<br><br>Multiplier: x<span class="multiplier">${multiplier.toFixed(1)}</span>.<br>Balance: $${balance.toFixed(2)}`;
                outputPaper.classList.add('win');
            } else {
                balance -= betAmount;
                resultDisplay.innerHTML = `😢 You lose!<br><br>Balance: $${balance.toFixed(2)}`;
                outputPaper.classList.add('lose');
            }

            updateBalanceDisplay();
            outputPaper.classList.add('show');
            headerLight.classList.add('blinking');
        }
    }

    rotate();
}

// Function to close the output paper
function closeOutputPaper() {
    outputPaper.classList.remove('show');
    headerLight.classList.remove('blinking');
}

// Event listener for the spin button
document.getElementById('spinButton').addEventListener('click', () => {
    spinWheel();
});

// Initial drawing of the roulette wheel
function animate() {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(currentAngle * Math.PI / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawRouletteWheel();
    ctx.restore();

    requestAnimationFrame(animate);
}

window.onload = function() {
    // Replace this with a fixed value or a user input mechanism for balance
    balance = 100; // Example starting balance
    updateBalanceDisplay();
    animate();
};
