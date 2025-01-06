// Game elements
let gameArea = document.getElementById('game-area');
let startScreen = document.getElementById('start-screen');
let startButton = document.getElementById('start-btn');
let spaceship = document.getElementById('spaceship');
let scoreElement = document.getElementById('score');
let livesElement = document.getElementById('lives');
let skillListElement = document.getElementById('skill-list');

let spaceshipX = 0; // Spaceship X position
let spaceshipY = 0; // Spaceship Y position
let spaceshipLifeline = 3; // Lifeline of the spaceship
let lasers = [];
let asteroids = [];
let score = 0;

let activeSkills = []; // List to track active skills and their timers
let fireRate = 300; // Default fire rate
let scatterLaser = false; // Skill: Scatter Laser
let shieldActive = false; // Skill: Shield

let isTouching = false; // To track if the user is currently touching
let touchStartX = 0; // Store the initial touch position X
let touchStartY = 0; // Store the initial touch position Y

// Start game on Play button click
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none'; // Hide the start screen
    gameArea.style.display = 'block'; // Show the game area
    startGame(); // Start the game logic
});

// Function to start the game
function startGame() {
    spaceshipX = window.innerWidth / 2 - 25; // Center the spaceship horizontally
    spaceshipY = window.innerHeight - 100; // Position near the bottom
    spaceship.style.left = `${spaceshipX}px`;
    spaceship.style.top = `${spaceshipY}px`;

    // Add touch controls
    gameArea.addEventListener('touchstart', handleTouchStart); // Touch controls
    gameArea.addEventListener('touchmove', handleTouchMove); // Drag for movement
    gameArea.addEventListener('touchend', handleTouchEnd); // Touch release fires a laser

    setInterval(spawnAsteroid, 2000); // Spawn asteroids periodically every 2 seconds
    setInterval(() => shootLaser(), fireRate); // Automatically shoot lasers at the set fire rate
}

// Handle touch start (moving spaceship)
function handleTouchStart(event) {
    isTouching = true; // Start touch
    const touch = event.touches[0];
    touchStartX = touch.clientX; // Store initial touch X
    touchStartY = touch.clientY; // Store initial touch Y
}

// Handle touch move (drag for spaceship movement)
function handleTouchMove(event) {
    event.preventDefault(); // Prevent default scrolling behavior
    if (isTouching) {
        const touch = event.touches[0];
        moveSpaceshipTo(touch.clientX, touch.clientY); // Update spaceship position to touch point
    }
}

// Handle touch end (fire laser)
function handleTouchEnd(event) {
    isTouching = false; // Stop touching
    shootLaser(); // Fire the laser once when touch ends
}

// Move the spaceship to a specific position
function moveSpaceshipTo(x, y) {
    spaceshipX = Math.min(Math.max(x - spaceship.offsetWidth / 2, 0), window.innerWidth - spaceship.offsetWidth); // Clamp position within bounds
    spaceshipY = Math.min(Math.max(y - spaceship.offsetHeight / 2, 0), window.innerHeight - spaceship.offsetHeight);
    spaceship.style.left = `${spaceshipX}px`;
    spaceship.style.top = `${spaceshipY}px`;
}

// Function to shoot lasers (only fires once on touch end)
function shootLaser() {
    document.getElementById('fire-sound').play();
    const middleLaser = document.createElement('div');
    middleLaser.className = 'laser';
    middleLaser.style.left = `${spaceshipX + spaceship.offsetWidth / 2 - 2.5}px`; // Center the laser
    middleLaser.style.bottom = `${window.innerHeight - spaceshipY - spaceship.offsetHeight + 5}px`; // Start above spaceship
    gameArea.appendChild(middleLaser);
    lasers.push(middleLaser);

    if (scatterLaser) createScatterLasers(); // Create scatter lasers if active
    moveLaser(middleLaser, 0); // Move middle laser
}

// Create scatter lasers
function createScatterLasers() {
    // Left laser
    const leftLaser = document.createElement('div');
    leftLaser.className = 'laser';
    leftLaser.style.left = `${spaceshipX}px`;
    leftLaser.style.bottom = `${window.innerHeight - spaceshipY - spaceship.offsetHeight + 5}px`;
    gameArea.appendChild(leftLaser);
    lasers.push(leftLaser);

    // Right laser
    const rightLaser = document.createElement('div');
    rightLaser.className = 'laser';
    rightLaser.style.left = `${spaceshipX + spaceship.offsetWidth - 5}px`;
    rightLaser.style.bottom = `${window.innerHeight - spaceshipY - spaceship.offsetHeight + 5}px`;
    gameArea.appendChild(rightLaser);
    lasers.push(rightLaser);

    moveLaser(leftLaser, -2); // Angle left
    moveLaser(rightLaser, 2); // Angle right
}

// Move lasers
function moveLaser(laser, angle) {
    let laserInterval = setInterval(() => {
        const laserBottom = parseInt(window.getComputedStyle(laser).bottom);
        const laserLeft = parseInt(window.getComputedStyle(laser).left);

        laser.style.bottom = `${laserBottom + 10}px`; // Move laser upwards
        laser.style.left = `${laserLeft + angle}px`; // Adjust for angled lasers

        if (laserBottom > window.innerHeight || laserLeft < 0 || laserLeft > window.innerWidth) {
            clearInterval(laserInterval);
            laser.remove();
        }
    }, 30);
}

// Spawn asteroids
function spawnAsteroid() {
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    asteroid.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
    asteroid.style.top = `-50px`;
    gameArea.appendChild(asteroid);
    asteroids.push(asteroid);

    let asteroidInterval = setInterval(() => {
        const asteroidTop = parseInt(window.getComputedStyle(asteroid).top);
        asteroid.style.top = `${asteroidTop + 5}px`;

        const asteroidRect = asteroid.getBoundingClientRect();
        const spaceshipRect = spaceship.getBoundingClientRect();

        if (isCollision(asteroidRect, spaceshipRect)) {
            document.getElementById('explode-sound').play();
            if (!shieldActive) {
                spaceshipLifeline -= 1;
                livesElement.innerText = `Spaceship Lifeline: ${spaceshipLifeline}`;
            }

            asteroid.remove();
            clearInterval(asteroidInterval);

            if (spaceshipLifeline <= 0) {
                spaceship.classList.add('destroyed');
                setTimeout(() => {
                    spaceship.remove();
                    alert(`Game Over! Your Total Score: ${score}`);
                    window.location.reload();
                }, 500);
            }
        }

        lasers.forEach((laser) => {
            const laserRect = laser.getBoundingClientRect();
            if (isCollision(asteroidRect, laserRect)) {
                document.getElementById('destroy-sound').play();
                asteroid.remove();
                laser.remove();
                score++;
                scoreElement.innerText = `Score: ${score}`;
                clearInterval(asteroidInterval);
            }
        });

        if (asteroidTop > window.innerHeight) {
            asteroid.remove();
            clearInterval(asteroidInterval);
        }
    }, 50);
}

// Check collision between two elements
function isCollision(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

// Spawn skills
function spawnSkill(x, y) {
    const skill = document.createElement('div');
    skill.className = 'skill';
    skill.style.left = `${x}`;
    skill.style.top = `${y}`;
    gameArea.appendChild(skill);

    let skillInterval = setInterval(() => {
        const skillTop = parseInt(window.getComputedStyle(skill).top);
        skill.style.top = `${skillTop + 5}px`;

        // Skill collision with spaceship
        const skillRect = skill.getBoundingClientRect();
        const spaceshipRect = spaceship.getBoundingClientRect();

        if (isCollision(skillRect, spaceshipRect)) {
            activateSkill();
            skill.remove();
            clearInterval(skillInterval);
        }

        // Remove skill if it goes off-screen
        if (skillTop > window.innerHeight) {
            skill.remove();
            clearInterval(skillInterval);
        }
    }, 50);
}

// Function to activate skills
function activateSkill() {
    const skillType = Math.floor(Math.random() * 3); // Randomize skill type

    let newSkill = {
        name: '',
        timer: null,
        timeLeft: 10 // Skill lasts 10 seconds by default
    };

    switch (skillType) {
        case 0:
            scatterLaser = true;
            newSkill.name = 'Scatter Laser';
            break;
        case 1:
            fireRate = 80;
            newSkill.name = 'Increased Fire Rate';
            break;
        case 2:
            shieldActive = true;
            spaceship.classList.add('shielded');
            newSkill.name = 'Shield';
            break;
    }

    // Check if the skill is already active and extend its timer
    const existingSkill = activeSkills.find(skill => skill.name === newSkill.name);
    if (existingSkill) {
        existingSkill.timeLeft += newSkill.timeLeft; // Extend time
        clearTimeout(existingSkill.timer); // Clear the previous timeout
        startSkillCountdown(existingSkill); // Restart countdown with the updated time
    } else {
        activeSkills.push(newSkill); // Add new skill to active skills list
        startSkillCountdown(newSkill); // Start countdown for the new skill
    }

    displaySkills(); // Update the skill list UI
}

// Display skills in the list
function displaySkills() {
    skillListElement.innerHTML = ''; // Clear existing list
    activeSkills.forEach((skill) => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerText = `${skill.name} (${skill.timeLeft}s)`;
        skillListElement.appendChild(skillItem);
    });
}

// Start skill countdown
function startSkillCountdown(skill) {
    skill.timer = setInterval(() => {
        skill.timeLeft--;
        displaySkills(); // Update the display with the remaining time

        if (skill.timeLeft <= 0) {
            clearInterval(skill.timer);
            deactivateSkill(skill);
        }
    }, 1000);
}

// Deactivate skills
function deactivateSkill(skill) {
    if (skill.name === 'Scatter Laser') scatterLaser = false;
    else if (skill.name === 'Increased Fire Rate') fireRate = 300;
    else if (skill.name === 'Shield') {
        shieldActive = false;
        spaceship.classList.remove('shielded');
    }

    // Remove the skill from the active skills list
    activeSkills = activeSkills.filter((s) => s !== skill);
    displaySkills(); // Update the skill list UI
}

