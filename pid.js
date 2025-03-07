// Canvas setup
const canvas = document.getElementById('pidCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 150;

// PID variables
let kp = 1.0; // Proportional gain
let ki = 0.0; // Integral gain
let kd = 0.0; // Derivative gain
let errorSum = 0;
let lastError = 0;
let setpoint = 0; // Target position (angle in radians)
let currentAngle = 0; // Follower position (angle in radians)

// Sliders
const pSlider = document.getElementById('pGain');
const iSlider = document.getElementById('iGain');
const dSlider = document.getElementById('dGain');
const pValue = document.getElementById('pValue');
const iValue = document.getElementById('iValue');
const dValue = document.getElementById('dValue');

pSlider.oninput = () => { kp = parseFloat(pSlider.value); pValue.textContent = kp; };
iSlider.oninput = () => { ki = parseFloat(iSlider.value); iValue.textContent = ki; };
dSlider.oninput = () => { kd = parseFloat(dSlider.value); dValue.textContent = kd; };

// PID Controller
function computePID(target, current, dt) {
    const error = target - current;
    errorSum += error * dt;
    const dError = (error - lastError) / dt;
    lastError = error;
    return kp * error + ki * errorSum + kd * dError;
}

// Animation
let time = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Oscillating target (setpoint)
    time += 0.05;
    setpoint = Math.sin(time) * Math.PI / 2; // Oscillates between -90° and 90°

    // PID calculation
    const dt = 0.05; // Time step
    const pidOutput = computePID(setpoint, currentAngle, dt);
    currentAngle += pidOutput * dt; // Update follower position

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

    // Draw follower line (blue)
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
