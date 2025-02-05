
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

    document.addEventListener('keydown', handleKeydown); // Add keyboard controls
    setInterval(spawnAsteroid, 2000); // Spawn asteroids periodically every 2 seconds
    setInterval(() => shootLaser(), fireRate); // Automatically shoot lasers at the set fire rate
}

// Handle spaceship movement
function handleKeydown(event) {
    const step = 20; // Movement step size
    if (event.key === 'ArrowLeft' && spaceshipX > 0) spaceshipX -= step; // Move left
    else if (event.key === 'ArrowRight' && spaceshipX < window.innerWidth - spaceship.offsetWidth) spaceshipX += step; // Move right
    else if (event.key === 'ArrowUp' && spaceshipY > 0) spaceshipY -= step; // Move up
    else if (event.key === 'ArrowDown' && spaceshipY < window.innerHeight - spaceship.offsetHeight) spaceshipY += step; // Move down

    spaceship.style.left = `${spaceshipX}px`;
    spaceship.style.top = `${spaceshipY}px`;
}

// Function to shoot lasers
function shootLaser() {
    
    document.getElementById('fire-sound').play();
    // Create the middle laser
    const middleLaser = document.createElement('div');
    middleLaser.className = 'laser';
    middleLaser.style.left = `${spaceshipX + spaceship.offsetWidth / 2 - 2.5}px`; // Center the laser
    middleLaser.style.bottom = `${window.innerHeight - spaceshipY - spaceship.offsetHeight + 5}px`; // Start above spaceship
    gameArea.appendChild(middleLaser);
    lasers.push(middleLaser);

    // If scatter laser is active, create left and right lasers
    if (scatterLaser) {
        createScatterLasers(); // Function to create scatter lasers
    }

    moveLaser(middleLaser, 0); // Move middle laser
}

// Function to create scatter lasers
function createScatterLasers() {
    // Left laser
    const leftLaser = document.createElement('div');
    leftLaser.className = 'laser';
    leftLaser.style.left = `${spaceshipX}px`; // Slightly left of spaceship
    leftLaser.style.bottom = `${window.innerHeight - spaceshipY - spaceship.offsetHeight + 5}px`;
    gameArea.appendChild(leftLaser);
    lasers.push(leftLaser);

    // Right laser
    const rightLaser = document.createElement('div');
    rightLaser.className = 'laser';
    rightLaser.style.left = `${spaceshipX + spaceship.offsetWidth - 5}px`; // Slightly right of spaceship
    rightLaser.style.bottom = `${window.innerHeight - spaceshipY - spaceship.offsetHeight + 5}px`;
    gameArea.appendChild(rightLaser);
    lasers.push(rightLaser);

    moveLaser(leftLaser, -2); // Angle left
    moveLaser(rightLaser, 2); // Angle right
}

// Helper function to move lasers
function moveLaser(laser, angle) {
    let laserInterval = setInterval(() => {
        const laserBottom = parseInt(window.getComputedStyle(laser).bottom);
        const laserLeft = parseInt(window.getComputedStyle(laser).left);

        laser.style.bottom = `${laserBottom + 10}px`; // Move laser upwards
        laser.style.left = `${laserLeft + angle}px`; // Adjust horizontal position for angled lasers

        // Remove laser if it goes off-screen
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
    asteroid.style.top = `-50px`; // Start above the screen
    gameArea.appendChild(asteroid);
    asteroids.push(asteroid);

    let asteroidInterval = setInterval(() => {
        const asteroidTop = parseInt(window.getComputedStyle(asteroid).top);
        asteroid.style.top = `${asteroidTop + 5}px`;

        // Collision detection with spaceship
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

        // Collision detection with lasers
        lasers.forEach((laser) => {
            const laserRect = laser.getBoundingClientRect();
            if (isCollision(asteroidRect, laserRect)) {
                document.getElementById('destroy-sound').play();
                asteroid.remove();
                laser.remove();
                score++;
                scoreElement.innerText = `Score: ${score}`;
                clearInterval(asteroidInterval);

                // 1 in 15 chance to spawn a skill
                if (Math.floor(Math.random() * 10) === 0) {
                    spawnSkill(asteroid.style.left, asteroid.style.top); // Spawn skill with 1/12 chance
                }
            }
        });

        // Remove asteroid if it goes off-screen
        if (asteroidTop > window.innerHeight) {
            asteroid.remove();
            clearInterval(asteroidInterval);
        }
    }, 50);
}

// Check for collision between two elements
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

