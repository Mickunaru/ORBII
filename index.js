const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const modalScoreEl = document.querySelector('#modal-score');
const gameOverModalEl = document.querySelector('#game-over-modal-el');
const retryBtn = document.querySelector('#retry-btn');
const roleSelectModal = document.querySelector('#role-selection-modal-el');
const roleBtns = document.querySelectorAll('.role-btn');

canvas.width = innerWidth;
canvas.height = innerHeight;
const borderWidth = 10;

class Player {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    if (this.x - this.velocity.xl - this.radius > borderWidth) this.x += this.velocity.xl;
    if (this.x + this.velocity.xr + this.radius < canvas.width - borderWidth) this.x += this.velocity.xr;
    if (this.y - this.velocity.yu - 2 * this.radius > borderWidth) this.y += this.velocity.yu;
    if (this.y + this.velocity.yd + this.radius < canvas.height - borderWidth) this.y += this.velocity.yd;
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Mob {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}


const middleX = canvas.width / 2;
const middleY = canvas.height / 2;

let player = new Player(middleX, middleY, 15, '#f8fafc', {xl: 0, xr:0, yu: 0, yd: 0});
let projectiles = [];
let mobs = [];
let role;

function initialize() {
  player = new Player(middleX, middleY, 15, '#f8fafc', {xl: 0, xr:0, yu: 0, yd: 0});
  projectiles = [];
  mobs = [];
  score = 0;
  scoreEl.textContent = score;
}

let spawnId;
function spawnMob() {
  spawnId = setInterval(() => {
    const randVal = Math.random();
    let velocityMultiplier = 1;
    let x;
    let y;
    let radius;
    let color;
    let velocity;
    if (randVal < 0.5) {
      x = Math.random() < 0.5 ? -50 : canvas.width + 50;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? -50 : canvas.height + 50;
    }
    const angle = Math.atan2(player.y - y, player.x - x);
    if (randVal < 0.6) {
      radius =  25;
      color = '#a3e635';
      velocity = {
        x: Math.cos(angle) * velocityMultiplier,
        y: Math.sin(angle) * velocityMultiplier
      }
    } else if (randVal < 0.95) {
      radius =  10;
      color = '#fbbf24';
      velocity = {
        x: Math.cos(angle) * 5 * velocityMultiplier,
        y: Math.sin(angle) * 5 * velocityMultiplier
      }
    } else {
      radius =  80;
      color = '#1e1b4b';
      velocity = {
        x: Math.cos(angle) * 0.66 * velocityMultiplier,
        y: Math.sin(angle) * 0.66 * velocityMultiplier
      }
    }
    mobs.push(new Mob(x, y, radius, color, velocity));
    velocityMultiplier += 1.05;
  }, 1000)
}

let score = 0;
let animateId;
function animate() {
  animateId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0,0,0,0.4)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  projectiles.forEach((projectile, pIndex) => {
    if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height) {
      setTimeout(() => {
        projectiles.splice(pIndex, 1);
      }, 0);
    }
    projectile.update();
  })

  mobs.forEach((mob, mIndex) => {
    mob.update();

    if (mob.x < -50 || mob.x > innerWidth + 50) mob.velocity.x = -mob.velocity.x;
    if (mob.y < -50 || mob.y > innerHeight + 50) mob.velocity.y = -mob.velocity.y;

    const dist = Math.hypot(player.x - mob.x, player.y - mob.y);
    if (dist - player.radius - mob.radius < 0.5) {
      stopGame();
    }

    projectiles.forEach((projectile, pIndex) => {
      const dist = Math.hypot(projectile.x - mob.x, projectile.y - mob.y);
      if (dist - projectile.radius - mob.radius < 0.5) {
        if (mob.radius - 5 > 10) {
          gsap.to(mob, {
            radius: mob.radius - 5
          })
          score += 10;
        } else {
          setTimeout(() => {
            mobs.splice(mIndex, 1);
          }, 0);
          score += 100;
        }
        scoreEl.textContent = score;
        setTimeout(() => {
          projectiles.splice(pIndex, 1);
        }, 0);
        
      }
    })
  })
}


addEventListener('keydown', (e) => {
  if (e.key === 'w') player.velocity.yu = -2.5;
  if (e.key === 'a') player.velocity.xl = -2.5;
  if (e.key === 's') player.velocity.yd = 2.5;
  if (e.key === 'd') player.velocity.xr = 2.5;
})

addEventListener('keyup', (e) => {
  if (e.key === 'w') player.velocity.yu = 0;
  if (e.key === 'a') player.velocity.xl = 0;
  if (e.key === 's') player.velocity.yd = 0;
  if (e.key === 'd') player.velocity.xr = 0;
})

function run() {
  initialize();
  animate();
  spawnMob();
  roleSelectModal.hidden = true;
}

function stopGame() {
  resetEventListeners(role);
  cancelAnimationFrame(animateId);
  modalScoreEl.textContent = score;
  gameOverModalEl.hidden = false;
  clearInterval(animateId);
  clearInterval(spawnId);
}

retryBtn.addEventListener('click', () => {
  roleSelectModal.hidden = false;
  gameOverModalEl.hidden = true;
});

function handleMouseDownBro(e) {
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  const velocity = {
    x: Math.cos(angle) * 8,
    y: Math.sin(angle) * 8
  }
  projectiles.push(new Projectile(player.x, player.y, 5, player.color, velocity));
}

function handleMouseDownTriple(e) {
  const deg15 = 0.261799;
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  const velocity1 = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  const velocity2 = {
    x: Math.cos(angle + deg15) * 5,
    y: Math.sin(angle + deg15) * 5
  }
  const velocity3 = {
    x: Math.cos(angle - deg15) * 5,
    y: Math.sin(angle - deg15) * 5
  }
  projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity1));
  projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity2));
  projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity3));
}

let canShoot = false;

function handleMouseDownGod() {
  canShoot = true;
}

function handleMouseUpGod() {
  canShoot = false;
}

function handleMouseMoveGod(e) {
  if (canShoot) {
    const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity));
  }
}

function resetEventListeners(role) {
  switch (role) {
    case 'Bro':
      removeEventListener('mousedown', handleMouseDownBro);
      break;
    case 'Triple':
      removeEventListener('mousedown', handleMouseDownTriple);
      break;
    case 'God':
      removeEventListener('mousedown', handleMouseDownGod);
      removeEventListener('mouseup', handleMouseUpGod);
      removeEventListener('mousemove', handleMouseMoveGod);
      break;
  }
}

function loadRole(role) {
  switch (role) {
    case 'Bro':
      addEventListener('mousedown', handleMouseDownBro);
      break;
    case 'Triple':
      addEventListener('mousedown', handleMouseDownTriple);
      break;
    case 'God':
      addEventListener('mousedown', handleMouseDownGod);
      addEventListener('mouseup', handleMouseUpGod);
      addEventListener('mousemove', handleMouseMoveGod);
      break;
  }
}

Array.from(roleBtns).forEach((btn) => {
  btn.addEventListener('click', (e) => {
    role = e.target.value;
    loadRole(role);
    run();
  });
})