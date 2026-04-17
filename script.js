// ============================================================
//  Giga Pet — script.js
// ============================================================

// Wait for the DOM to be fully loaded before running anything
document.addEventListener('DOMContentLoaded', function () {

  // ----------------------------------------------------------
  // 1. PET DATA OBJECT
  // ----------------------------------------------------------
  var pet_info = {
    name:        'Barkley',
    weight:      20,
    happiness:   15,
    energy:      10,
    maxWeight:    50,
    maxHappiness: 30,
    maxEnergy:    20
  };

  // ----------------------------------------------------------
  // 2. REACTION POOLS
  // ----------------------------------------------------------
  var reactions = {
    treat:    ['Yum yum!! 🦴', 'More please!', 'WOOF! 🐾', 'ARF ARF!', 'Belly full~ ♡'],
    play:     ['So much fun! 🎾', 'Catch me!', 'ZOOM ZOOM 🐕', 'Play again?', 'wheeeee~!'],
    exercise: ['Ugh… fine.', 'My paws hurt 😤', 'Is it over yet?', 'I need a nap now.', '*pants heavily*'],
    nap:      ['Zzz… zzz… 💤', 'So cozy~ 🛌', 'Five more mins…', 'Dream mode ON', '*snores cutely*'],
    sad:      ["I'm sooo bored 😢", 'Feed me plz…', 'I need love ❤', 'Hello?? Anyone??'],
    chubby:   ['I might be too thicc 😅', 'Diet starts Monday.', 'Waddling intensifies…'],
    energized:['Fully charged! ⚡', "LET'S GOOO!", 'MAXIMUM POWER!'],
    tooTired: ["I'm too tired! 💤", 'Need a nap first…', "zzz… can't move.", 'No energy! 😴', 'Let me sleep plz!']
  };

  // ----------------------------------------------------------
  // 3. SOUND ENGINE (Web Audio API — no files needed)
  //    Wrapped in try/catch so a failed sound call can NEVER
  //    crash the button logic.
  // ----------------------------------------------------------
  var audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playSound(buildFn) {
    try {
      var ctx = getAudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().then(function () {
          try { buildFn(ctx); } catch (e) {}
        });
      } else {
        buildFn(ctx);
      }
    } catch (e) {}
  }

  function soundTreat() {
    playSound(function (ctx) {
      var gain = ctx.createGain();
      gain.connect(ctx.destination);
      [440, 660].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        osc.connect(gain);
        var t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    });
  }

  function soundPlay() {
    playSound(function (ctx) {
      var gain = ctx.createGain();
      gain.connect(ctx.destination);
      [523, 659, 784].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        var t = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    });
  }

  function soundExercise() {
    playSound(function (ctx) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    });
  }

  function soundNap() {
    playSound(function (ctx) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 180;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.25);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.start();
      osc.stop(ctx.currentTime + 0.75);
    });
  }

  function soundTooTired() {
    playSound(function (ctx) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 100;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    });
  }

  function soundAlert() {
    playSound(function (ctx) {
      var gain = ctx.createGain();
      gain.connect(ctx.destination);
      [440, 330].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        osc.connect(gain);
        var t = ctx.currentTime + i * 0.14;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    });
  }

  // ----------------------------------------------------------
  // 4. BUTTON CLICK HANDLERS (plain JS — no jQuery needed)
  // ----------------------------------------------------------

  // TREAT — happiness +3, weight +2
  document.querySelector('.treat-button').addEventListener('click', function () {
    pet_info.happiness += 3;
    pet_info.weight    += 2;
    soundTreat();
    showReaction(reactions.treat);
    animatePet('bounce');
    checkAndUpdatePetInfoInHtml();
  });

  // PLAY — happiness +4, weight -2, energy -2
  document.querySelector('.play-button').addEventListener('click', function () {
    if (pet_info.energy <= 0) {
      soundTooTired();
      showReaction(reactions.tooTired);
      animatePet('shake');
      return;
    }
    pet_info.happiness += 4;
    pet_info.weight    -= 2;
    pet_info.energy    -= 2;
    soundPlay();
    showReaction(reactions.play);
    animatePet('wiggle');
    checkAndUpdatePetInfoInHtml();
  });

  // EXERCISE — happiness -2, weight -3, energy -3
  document.querySelector('.exercise-button').addEventListener('click', function () {
    if (pet_info.energy <= 0) {
      soundTooTired();
      showReaction(reactions.tooTired);
      animatePet('shake');
      return;
    }
    pet_info.happiness -= 2;
    pet_info.weight    -= 3;
    pet_info.energy    -= 3;
    soundExercise();
    showReaction(reactions.exercise);
    animatePet('shake');
    checkAndUpdatePetInfoInHtml();
  });

  // NAP — energy +5, happiness -1
  document.querySelector('.nap-button').addEventListener('click', function () {
    pet_info.energy    += 5;
    pet_info.happiness -= 1;
    soundNap();
    showReaction(reactions.nap);
    animatePet('sleep');
    checkAndUpdatePetInfoInHtml();
  });

  // ----------------------------------------------------------
  // 5. CORE UPDATE PIPELINE
  // ----------------------------------------------------------
  function checkAndUpdatePetInfoInHtml() {
    checkWeightAndHappinessBeforeUpdating();
    updatePetInfoInHtml();
    updateStatBars();
    updatePetMood();
    updateStatusBar();
  }

  function checkWeightAndHappinessBeforeUpdating() {
    if (pet_info.weight < 0)  { pet_info.weight = 0; }
    if (pet_info.weight > pet_info.maxWeight) {
      pet_info.weight = pet_info.maxWeight;
      showReaction(reactions.chubby);
      soundAlert();
    }
    if (pet_info.happiness < 0) {
      pet_info.happiness = 0;
      showReaction(reactions.sad);
      soundAlert();
    }
    if (pet_info.happiness > pet_info.maxHappiness) { pet_info.happiness = pet_info.maxHappiness; }
    if (pet_info.energy < 0) { pet_info.energy = 0; }
    if (pet_info.energy > pet_info.maxEnergy) {
      pet_info.energy = pet_info.maxEnergy;
      showReaction(reactions.energized);
    }
  }

  function updatePetInfoInHtml() {
    document.querySelector('.name').textContent      = pet_info.name;
    document.querySelector('.weight').textContent    = pet_info.weight;
    document.querySelector('.happiness').textContent = pet_info.happiness;
    document.querySelector('.energy').textContent    = pet_info.energy;
  }

  // ----------------------------------------------------------
  // 6. STAT BARS
  //    jQuery .animate() is still used here since jQuery is
  //    still loaded — this gives the smooth fill effect.
  //    If jQuery fails to load, falls back to instant width set.
  // ----------------------------------------------------------
  function updateStatBars() {
    var weightPct    = (pet_info.weight    / pet_info.maxWeight)    * 100;
    var happinessPct = (pet_info.happiness / pet_info.maxHappiness) * 100;
    var energyPct    = (pet_info.energy    / pet_info.maxEnergy)    * 100;

    setBar('weightBar',    weightPct);
    setBar('happinessBar', happinessPct);
    setBar('energyBar',    energyPct);

    // Turn weight bar red when getting heavy
    var wb = document.getElementById('weightBar');
    wb.style.background = weightPct >= 80 ? '#ff4444' : '';
  }

  function setBar(id, pct) {
    var el = document.getElementById(id);
    if (!el) return;
    // Use jQuery animate if available, otherwise set directly
    if (window.jQuery) {
      jQuery('#' + id).animate({ width: pct + '%' }, 400);
    } else {
      el.style.width = pct + '%';
    }
  }

  // ----------------------------------------------------------
  // 7. STATUS BAR
  // ----------------------------------------------------------
  var moodConfig = {
    sad:     { label: '😢 SAD',    bg: '#1a0a0a', color: '#ff6b6b' },
    chubby:  { label: '😅 CHUBBY', bg: '#1a1500', color: '#ffd93d' },
    tired:   { label: '😴 TIRED',  bg: '#0a0a1a', color: '#a29bfe' },
    happy:   { label: '😊 HAPPY',  bg: '#0f380f', color: '#9bbc0f' }
  };

  function updateStatusBar() {
    var mood;
    if      (pet_info.happiness <= 3)  { mood = 'sad';    }
    else if (pet_info.weight    >= 40) { mood = 'chubby'; }
    else if (pet_info.energy    <= 2)  { mood = 'tired';  }
    else                               { mood = 'happy';  }

    var cfg = moodConfig[mood];
    var header = document.getElementById('screenHeader');
    var title  = document.getElementById('screenTitle');
    if (header && title) {
      title.textContent        = cfg.label;
      header.style.backgroundColor = cfg.bg;
      header.style.color           = cfg.color;
    }
  }

  // ----------------------------------------------------------
  // 8. SPEECH BUBBLE
  // ----------------------------------------------------------
  var speechTimeout = null;

  function showReaction(pool) {
    var line = pool[Math.floor(Math.random() * pool.length)];
    var bubble = document.getElementById('speechBubble');
    var text   = document.getElementById('speechText');
    if (!bubble || !text) return;

    text.textContent = line;

    // Clear any pending hide timer
    if (speechTimeout) { clearTimeout(speechTimeout); }

    // Show immediately, hide after 2.5s
    bubble.style.display   = 'block';
    bubble.style.opacity   = '1';
    speechTimeout = setTimeout(function () {
      bubble.style.opacity = '0';
      setTimeout(function () { bubble.style.display = 'none'; }, 400);
    }, 2500);
  }

  // ----------------------------------------------------------
  // 9. PET MOOD
  // ----------------------------------------------------------
  function updatePetMood() {
    var sprite = document.getElementById('petSprite');
    if (!sprite) return;
    sprite.classList.remove('mood-happy', 'mood-sad', 'mood-chubby', 'mood-tired');

    if      (pet_info.happiness <= 3)  { sprite.classList.add('mood-sad');    }
    else if (pet_info.weight    >= 40) { sprite.classList.add('mood-chubby'); }
    else if (pet_info.energy    <= 2)  { sprite.classList.add('mood-tired');  }
    else                               { sprite.classList.add('mood-happy');  }
  }

  // ----------------------------------------------------------
  // 10. SPRITE ANIMATIONS
  // ----------------------------------------------------------
  function animatePet(type) {
    var wrap = document.querySelector('#petSprite .sprite-wrap');
    if (!wrap) return;
    wrap.classList.remove('anim-bounce', 'anim-wiggle', 'anim-shake', 'anim-sleep');
    setTimeout(function () {
      wrap.classList.add('anim-' + type);
      setTimeout(function () {
        wrap.classList.remove('anim-bounce', 'anim-wiggle', 'anim-shake', 'anim-sleep');
      }, 700);
    }, 10);
  }

  // ----------------------------------------------------------
  // 11. INIT — run on page load
  // ----------------------------------------------------------
  checkAndUpdatePetInfoInHtml();

}); // end DOMContentLoaded