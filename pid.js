const canvas = document.getElementById('pidCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 150;

// PID variables
let kp = 1.0;
let ki = 0.0;
let kd = 0.0;
let errorSum = 0;
let lastError = 0;
let setpoint = 0;
let currentAngle = 0;
let speed = 1.0;
let lastDError = 0;

// Trail history
const trail = [];
const maxTrailLength = 10;

// Sliders and controls
const speedSlider = document.getElementById('speed');
const pSlider = document.getElementById('pGain');
const iSlider = document.getElementById('iGain');
const dSlider = document.getElementById('dGain');
const speedValue = document.getElementById('speedValue');
const pValue = document.getElementById('pValue');
const iValue = document.getElementById('iValue');
const dValue = document.getElementById('dValue');
const autotuneBtn = document.getElementById('autotune');

speedSlider.oninput = () => { speed = parseFloat(speedSlider.value); speedValue.textContent = speed; };
pSlider.oninput = () => { kp = parseFloat(pSlider.value); pValue.textContent = kp; };
iSlider.oninput = () => { ki = parseFloat(iSlider.value); iValue.textContent = ki; };
dSlider.oninput = () => { kd = parseFloat(dSlider.value); dValue.textContent = kd; };

// PID Controller
function computePID(target, current, dt) {
    const error = target - current;
    errorSum = Math.max(Math.min(errorSum + error * dt, 10), -10);
    const rawDError = (error - lastError) / dt;
    const dError = lastDError + 0.1 * (rawDError - lastDError);
    lastDError = dError;
    lastError = error;
    const pidOutput = kp * error + ki * errorSum + kd * dError;
    return Math.max(Math.min(pidOutput, 10), -10);
}

// Autotune (unchanged for brevity)
function autotune() {
    let ku = 0;
    let tu = 0;
    let oscillating = false;
    let lastAngle = 0;
    let crosses = [];
    const testKpStep = 0.1;
    let testKp = 0;

    function testStep(timestamp) {
        const error = setpoint - currentAngle;
        currentAngle += testKp * error * 0.05;
        if (lastAngle < 0 && currentAngle >= 0) {
            crosses.push(timestamp);
            if (crosses.length > 2) {
                tu = (crosses[crosses.length - 1] - crosses[crosses.length - 3]) / 1000;
                oscillating = true;
            }
        }
        lastAngle = currentAngle;
        if (!oscillating) {
            testKp += testKpStep;
            requestAnimationFrame(testStep);
        } else {
            ku = testKp;
            kp = 0.6 * ku;
            ki = 1.2 * ku / tu;
            kd = 0.075 * ku * tu;
            pSlider.value = kp;
            iSlider.value = ki;
            dSlider.value = kd;
            pValue.textContent = kp.toFixed(2);
            iValue.textContent = ki.toFixed(2);
            dValue.textContent = kd.toFixed(2);
            errorSum = 0;
            animate();
        }
    }

    pSlider.disabled = true;
    iSlider.disabled = true;
    dSlider.disabled = true;
    ki = 0; kd = 0;
    requestAnimationFrame(testStep);
}

autotuneBtn.onclick = autotune;

// Animation
let time = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Oscillating target
    time += 0.05 * speed;
    setpoint = Math.sin(time) * Math.PI / 2;

    const dt = 0.05;
    const pidOutput = computePID(setpoint, currentAngle, dt);
    currentAngle += pidOutput * dt * 1.5; // Exaggerate motion by 1.5x

    // Add to trail
    trail.push(currentAngle);
    if (trail.length > maxTrailLength) trail.shift();

    // Draw wheel
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw target line (red)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(setpoint);
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw trail (faint blue lines)
    for (let i = 0; i < trail.length; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(trail[i]);
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(0, radius);
        ctx.strokeStyle = `rgba(0, 0, 255, ${i / maxTrailLength * 0.3})`; // Fade effect
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    // Draw follower line (solid blue)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    requestAnimationFrame(animate);
}

animate();
