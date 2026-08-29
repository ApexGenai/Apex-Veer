let currentTheme = localStorage.getItem('apex-display-mode') || 'noir';
document.documentElement.className = 'theme-' + currentTheme;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse)').matches;

/* ================= WORLD (persistent spine interface shim) ================= */
const World = {
  ready: true,
  setScrollTarget(t) {},
  beginForm() {},
  nodes: [],
  transitionTheme(theme) {}
};

function updateScrollTarget(){
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  const t = max>0 ? window.scrollY / max : 0;
  
  // Custom scroll fades
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  
  // 1. Intro Film Video opacity
  const introFilm = document.getElementById('intro-film');
  if (introFilm) {
    const video = introFilm.querySelector('.intro-film-video');
    if (scrollY < vh * 1.2) {
      const opacity = Math.max(0, 1.0 - (scrollY / vh));
      introFilm.style.opacity = opacity;
      if (video && video.paused) video.play();
    } else {
      introFilm.style.opacity = 0;
      if (video && !video.paused) video.pause();
    }
  }

  // 2. Department Transition camera glide
  const transSection = document.getElementById('studios-to-media-transition');
  if (transSection) {
    const rect = transSection.getBoundingClientRect();
    const sectionTop = rect.top + scrollY;
    if (scrollY > sectionTop - vh && scrollY < sectionTop + vh) {
      window.isTransitionGlide = true;
    } else {
      window.isTransitionGlide = false;
    }
  }

  World.setScrollTarget(t);
}
window.addEventListener('scroll', updateScrollTarget, {passive:true});

/* ================= LOADER ================= */
(function(){
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  if (!loader) {
    document.body.classList.remove('no-scroll');
    return;
  }
  const skip = sessionStorage.getItem('apex_loaded') === '1';

  function finish(){
    document.body.classList.remove('no-scroll');
    updateScrollTarget();
    if(World.beginForm) World.beginForm();
    sessionStorage.setItem('apex_loaded','1');
    if (loader) loader.classList.add('iris-out');
    setTimeout(()=>{ if (loader) loader.classList.add('done'); }, 1150);
  }

  if(skip || reduced){
    if (loader) loader.style.transition = 'none';
    requestAnimationFrame(finish);
    return;
  }

  if (loader) loader.classList.add('reveal');

  let p = 0;
  const totalTime = 2200;
  const startTime = performance.now();
  function tick(now){
    const elapsed = now - startTime;
    p = Math.min(100, Math.round((elapsed/totalTime)*100));
    if (fill) fill.style.width = p+'%';
    if (pct) pct.textContent = String(p).padStart(2,'0')+'%';
    if(p<100){ requestAnimationFrame(tick); } else { setTimeout(finish, 250); }
  }
  requestAnimationFrame(tick);
})();

/* ================= NAV SCROLL STATE ================= */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', ()=>{ header.classList.toggle('scrolled', window.scrollY>40); }, {passive:true});

/* ================= REVEALS ================= */
const revealEls = document.querySelectorAll('.reveal, .process-step, .portal, .reveal-line, .animate-title');
if(!reduced){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        setTimeout(()=>entry.target.classList.add('in'), entry.target.dataset.delay||0);
        io.unobserve(entry.target);
      }
    });
  },{threshold:0.15, rootMargin:'0px 0px -60px 0px'});
  revealEls.forEach((el,i)=>{ el.dataset.delay=(i%6)*70; io.observe(el); });
} else {
  revealEls.forEach(el=>el.classList.add('in'));
}

/* ================= MAGNETIC BUTTONS ================= */
if(!reduced && !isTouch){
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      const x = e.clientX-r.left-r.width/2, y = e.clientY-r.top-r.height/2;
      btn.style.transform = `translate(${x*0.18}px, ${y*0.35}px)`;
    });
    btn.addEventListener('mouseleave', ()=>btn.style.transform='translate(0,0)');
  });
}

/* ================= CUSTOM CURSOR ================= */
if(!isTouch){
  document.body.classList.add('cursor-active');
  const core = document.getElementById('cursorCore');
  const ring = document.getElementById('cursorRing');

  let mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my, cx=mx, cy=my;

  addEventListener('mousemove', e=>{
    mx=e.clientX; my=e.clientY;
  });

  const hoverTargets = 'a, button, .btn, .featured-project-card, .division-tile, .logo-card, .industry-card';
  document.addEventListener('mouseover', e=>{
    if(e.target.closest(hoverTargets)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', e=>{
    if(e.target.closest(hoverTargets)) ring.classList.remove('hover');
  });

  function raf(){
    requestAnimationFrame(raf);
    cx += (mx-cx)*0.9; cy += (my-cy)*0.9;
    rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
    if (core) core.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    if (ring) {
      ring.style.left = rx+'px';
      ring.style.top = ry+'px';
    }
  }
  raf();
}

/* ================= DETAILED CASE STUDIES POPUPS ================= */
const caseStudiesData = {
  ribbon: {
    category: "AI Film & CGI",
    title: "Northlight Brand Campaign",
    duration: "02:40",
    metric: "4.2M views",
    client: "Northlight Group",
    challenge: "Reimagining luxury clothing dynamics in zero gravity. Traditional CGI workflows were too slow and costly to render infinite variations.",
    results: "By training customized visual LoRAs rigged to physical plates, we synthetically simulated gravity sweeps. The campaign generated 4.2M views.",
    image: "https://images.pexels.com/photos/1933813/pexels-photo-1933813.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  grid: {
    category: "Commercial",
    title: "Fielder Outdoors Launch",
    duration: "01:15",
    metric: "+38% CTR",
    client: "Fielder Outdoor",
    challenge: "Launching an apparel brand online with limited production assets.",
    results: "We programmatically generated 400 video variations using our Content Engine. Paid ad campaign CTR rose by 38%, reducing general customer acquisition costs.",
    image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  orb: {
    category: "CGI Integration",
    title: "Vessel AI Character Series",
    duration: "05:15",
    metric: "CGI Series",
    client: "Vessel Ent.",
    challenge: "Maintaining character face consistency across multiple high-end cinematic animation reels.",
    results: "Custom model weights were trained on facial keyframes and composite templates, allowing 3D meshes to output uniform character models instantly.",
    image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
};

function openCaseStudy(sceneKey) {
  const data = caseStudiesData[sceneKey] || caseStudiesData.ribbon;
  const modalImg = document.getElementById('modalHeroImg');
  const modalVideo = document.getElementById('modalHeroVideo');
  
  if (modalImg && modalVideo) {
    modalImg.style.display = 'block';
    modalVideo.style.display = 'none';
    modalVideo.pause();
    modalVideo.src = "";
  }

  document.getElementById('modalHeroImg').src = data.image;
  document.getElementById('modalCategory').textContent = data.category;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalDuration').textContent = data.duration;
  document.getElementById('modalMetric').textContent = data.metric;
  document.getElementById('modalClient').textContent = data.client;
  document.getElementById('modalChallenge').textContent = data.challenge;
  document.getElementById('modalResults').textContent = data.results;
  document.getElementById('caseStudyModal').classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeCaseStudy() {
  document.getElementById('caseStudyModal').classList.remove('active');
  document.body.classList.remove('no-scroll');
  const modalVideo = document.getElementById('modalHeroVideo');
  if (modalVideo) {
    modalVideo.pause();
    modalVideo.src = "";
    modalVideo.removeAttribute('controls');
    modalVideo.muted = true;
  }
  
  // Restore elements for general modal usage
  const modalBody = document.querySelector('.cs-modal-body');
  if (modalBody) modalBody.style.display = '';
  
  const heroText = document.querySelector('.cs-modal-hero-text');
  if (heroText) heroText.style.display = '';

  const heroContainer = document.getElementById('modalHeroContainer');
  if (heroContainer) {
    heroContainer.style.height = '';
    heroContainer.style.borderBottom = '';
  }
}

/* ================= CONTACT FORM SUBMISSION ================= */
function toggleContactTag(btn) {
  btn.classList.toggle('active');
}

function submitContactForm() {
  const form = document.querySelector('.contact-form');
  const inputs = form.querySelectorAll('.form-input');
  
  let hasVal = true;
  inputs.forEach(input => {
    if (!input.value.trim()) hasVal = false;
  });
  
  if (!hasVal) {
    alert("Please complete the required form inputs.");
    return;
  }
  
  const submitBtn = form.querySelector('.btn-primary');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "TRANSMITTING DATA...";
  submitBtn.disabled = true;
  
  setTimeout(() => {
    submitBtn.textContent = "TRANSMISSION SUCCESSFUL ✓";
    submitBtn.style.background = "#22c55e";
    submitBtn.style.color = "#0A0A0B";
    
    setTimeout(() => {
      inputs.forEach(input => input.value = "");
      submitBtn.textContent = originalText;
      submitBtn.style.background = "var(--accent)";
      submitBtn.style.color = "#0A0A0B";
      submitBtn.disabled = false;
    }, 2000);
  }, 1500);
}

/* ================= DRAGGABLE BEFORE/AFTER SLIDER ================= */
(function() {
  const slider = document.getElementById('beforeAfterSlider');
  if (!slider) return;
  const divider = document.getElementById('sliderDivider');
  const finalImg = document.getElementById('sliderFinalImg');
  
  function setSliderPosition(x) {
    const rect = slider.getBoundingClientRect();
    let pct = (x - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    divider.style.left = (pct * 100) + '%';
    finalImg.style.clipPath = `polygon(0 0, ${pct * 100}% 0, ${pct * 100}% 100%, 0 100%)`;
    
    const labelConcept = document.getElementById('labelConcept');
    const labelFinal = document.getElementById('labelFinal');
    if (pct < 0.3) {
      labelConcept.classList.add('active');
      labelFinal.classList.remove('active');
    } else if (pct > 0.7) {
      labelConcept.classList.remove('active');
      labelFinal.classList.add('active');
    } else {
      labelConcept.classList.add('active');
      labelFinal.classList.add('active');
    }
  }
  
  let isDragging = false;
  
  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    setSliderPosition(e.clientX);
  });
  
  addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setSliderPosition(e.clientX);
  });
  
  addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    setSliderPosition(e.touches[0].clientX);
  });
  
  addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    setSliderPosition(e.touches[0].clientX);
  });
  
  addEventListener('touchend', () => {
    isDragging = false;
  });
})();



/* ================= ACCORDION CONTROL (FAQ) ================= */
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    const activeItem = document.querySelector('.accordion-item.active');
    
    if (activeItem && activeItem !== item) {
      activeItem.classList.remove('active');
      activeItem.querySelector('.accordion-panel').style.maxHeight = '0';
    }
    
    item.classList.toggle('active');
    const panel = item.querySelector('.accordion-panel');
    if (item.classList.contains('active')) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = '0';
    }
  });
});

/* ================= WORKFLOW HORIZONTAL LINES TRIGGER ================= */
const processObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const steps = entry.target.querySelectorAll('.process-step');
      steps.forEach((step, i) => {
        setTimeout(() => {
          step.classList.add('in');
          const bar = step.querySelector('.process-bar');
          if (bar) bar.style.width = '100%';
        }, i * 250);
      });
      processObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.process-strip').forEach(strip => processObserver.observe(strip));

/* ================= DISPLAY THEME TOGGLE CONTROLLER ================= */
function toggleDisplayMode() {
  const htmlEl = document.documentElement;
  const newTheme = (currentTheme === 'canvas') ? 'noir' : 'canvas';
  
  currentTheme = newTheme;
  localStorage.setItem('apex-display-mode', newTheme);
  htmlEl.className = 'theme-' + newTheme;

  // Update active status on labels (both header and mobile menu)
  const noirLabel = document.getElementById('modeNoir');
  const canvasLabel = document.getElementById('modeCanvas');
  const mobNoir = document.getElementById('mobileModeNoir');
  const mobCanvas = document.getElementById('mobileModeCanvas');

  if (newTheme === 'canvas') {
    if (noirLabel) noirLabel.className = 'mode-label';
    if (canvasLabel) canvasLabel.className = 'mode-label active-canvas';
    if (mobNoir) mobNoir.className = 'mode-label';
    if (mobCanvas) mobCanvas.className = 'mode-label active-canvas';
  } else {
    if (noirLabel) noirLabel.className = 'mode-label active-noir';
    if (canvasLabel) canvasLabel.className = 'mode-label';
    if (mobNoir) mobNoir.className = 'mode-label active-noir';
    if (mobCanvas) mobCanvas.className = 'mode-label';
  }

  // Trigger Three.js particle color interpolations
  if (typeof World !== 'undefined' && World.transitionTheme) {
    World.transitionTheme(newTheme);
  }
}

// Auto-initialize toggles on script execution
(function() {
  const noirLabel = document.getElementById('modeNoir');
  const canvasLabel = document.getElementById('modeCanvas');
  const mobNoir = document.getElementById('mobileModeNoir');
  const mobCanvas = document.getElementById('mobileModeCanvas');

  if (currentTheme === 'canvas') {
    if (noirLabel) noirLabel.className = 'mode-label';
    if (canvasLabel) canvasLabel.className = 'mode-label active-canvas';
    if (mobNoir) mobNoir.className = 'mode-label';
    if (mobCanvas) mobCanvas.className = 'mode-label active-canvas';
  } else {
    if (noirLabel) noirLabel.className = 'mode-label active-noir';
    if (canvasLabel) canvasLabel.className = 'mode-label';
    if (mobNoir) mobNoir.className = 'mode-label active-noir';
    if (mobCanvas) mobCanvas.className = 'mode-label';
  }
})();

/* ================= MOBILE NAVIGATION CONTROLLER ================= */
function toggleMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const overlay = document.getElementById('mobileMenuOverlay');
  const isOpening = !toggleBtn.classList.contains('open');

  if (isOpening) {
    toggleBtn.classList.add('open');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden'; // Lock scrolling
  } else {
    closeMobileMenu();
  }
}

function closeMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const overlay = document.getElementById('mobileMenuOverlay');
  
  if (toggleBtn) toggleBtn.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('menu-open');
  document.body.style.overflow = ''; // Restore scrolling
}

/* ================= CREATIVE LAB SWITCH TAB ================= */
function switchLabTab(index) {
  const tabs = document.querySelectorAll('.lab-explorer-tab');
  const panels = document.querySelectorAll('.lab-explorer-view .lab-explorer-panel');
  
  tabs.forEach((tab, i) => {
    if (i === index) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  panels.forEach((panel, i) => {
    if (i === index) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

function copyLabPrompt(btn) {
  const codeEl = btn.nextElementSibling;
  navigator.clipboard.writeText(codeEl.textContent).then(() => {
    const originalText = btn.textContent;
    btn.textContent = "COPIED ✓";
    btn.style.background = "#22c55e";
    btn.style.color = "#000";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "";
      btn.style.color = "";
    }, 1500);
  });
}

/* ================= CONTENT LIFECYCLE STEPS ================= */
const lifecycleData = [
  {
    title: "01 / INGESTION & DATA MINING",
    desc: "We automatically query competitor hooks, trending soundscapes, and platform search behaviors. This builds the prompt foundation and design constraints for our creative models."
  },
  {
    title: "02 / SYNTHESIS & AI PRODUCTION",
    desc: "Using customized model checkpoints and fast GPU render nodes, we synthesize visual frames, fabric geometries, and audio waveforms matching the exact prompt parameters."
  },
  {
    title: "03 / PROGRAMMATIC DEPLOYMENT",
    desc: "The generated assets are compiled into active ad accounts and campaign sets via marketing APIs, deploying hooks, copy, and layout variants instantly."
  },
  {
    title: "04 / REAL-TIME TELEMETRY",
    desc: "Our analytics pipelines monitor every conversion event and click-through signals in real-time, feeding campaign return parameters back into our decision trees."
  },
  {
    title: "05 / RE-SYNTHESIS & OPTIMIZATION",
    desc: "When an asset decays or drops in performance, the automation triggers re-ingestion, automatically adjusting prompt variations to launch fresh, optimized visual variants."
  }
];

let currentLifecycleStep = 0;
let lifecycleInterval = null;

function updateLifecycleUI(index) {
  const nodes = document.querySelectorAll('.lifecycle-node');
  const box = document.getElementById('lifecycleContentBox');
  
  nodes.forEach((node, i) => {
    if (i === index) {
      node.classList.add('active');
    } else {
      node.classList.remove('active');
    }
  });
  
  if (box) {
    box.style.opacity = 0;
    setTimeout(() => {
      const parts = lifecycleData[index].title.split(' / ');
      const numElem = document.getElementById('lcStepNum');
      const titleElem = document.getElementById('lcStepTitle');
      const descElem = document.getElementById('lcStepDesc');
      if (numElem) numElem.textContent = `STEP 0${index + 1}`;
      if (titleElem) titleElem.textContent = parts.length > 1 ? parts[1] : parts[0];
      if (descElem) descElem.textContent = lifecycleData[index].desc;
      box.style.opacity = 1;
      box.style.transition = 'opacity 0.4s ease';
    }, 200);
  }
}

function startLifecycleAutoRotate() {
  if (lifecycleInterval) clearInterval(lifecycleInterval);
  lifecycleInterval = setInterval(() => {
    currentLifecycleStep = (currentLifecycleStep + 1) % lifecycleData.length;
    updateLifecycleUI(currentLifecycleStep);
  }, 7000); // 7 seconds per step transition
}

function setLifecycleStep(index) {
  currentLifecycleStep = index;
  updateLifecycleUI(index);
  startLifecycleAutoRotate();
}

/* ================= EXPERIMENT VIDEOS HOVER PREVIEWS & MODALS ================= */
function playExperimentVideo(src, title, year, tools) {
  const modalImg = document.getElementById('modalHeroImg');
  const modalVideo = document.getElementById('modalHeroVideo');
  
  if (modalImg && modalVideo) {
    modalImg.style.display = 'none';
    modalVideo.style.display = 'block';
    modalVideo.src = src;
    modalVideo.muted = false; // Run with audio unmuted on user action click
    modalVideo.setAttribute('controls', ''); // Show player controls
    modalVideo.play().catch(err => {
      console.warn("Autoplay with audio blocked, playing muted fallback:", err);
      modalVideo.muted = true;
      modalVideo.play();
    });
  }
  
  // Hide readability elements
  const modalBody = document.querySelector('.cs-modal-body');
  if (modalBody) modalBody.style.display = 'none';
  
  const heroText = document.querySelector('.cs-modal-hero-text');
  if (heroText) heroText.style.display = 'none';

  // Expand the video container to occupy the full modal content area
  const heroContainer = document.getElementById('modalHeroContainer');
  if (heroContainer) {
    heroContainer.style.height = '100%';
    heroContainer.style.borderBottom = 'none';
  }
  
  document.getElementById('caseStudyModal').classList.add('active');
  document.body.classList.add('no-scroll');
}

(function() {
  const rows = document.querySelectorAll('.experiment-row');
  const preview = document.getElementById('experimentHoverPreview');
  const video = document.getElementById('experimentHoverVideo');
  
  if (!rows.length || !preview || !video) return;
  
  rows.forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      const onclickAttr = row.getAttribute('onclick');
      if (onclickAttr) {
        const matches = onclickAttr.match(/'([^']+)'/);
        if (matches && matches[1]) {
          video.src = matches[1];
          video.play();
          preview.classList.add('active');
        }
      }
    });
    
    row.addEventListener('mousemove', (e) => {
      preview.style.left = (e.clientX + 15) + 'px';
      preview.style.top = (e.clientY + 15) + 'px';
    });
    
    row.addEventListener('mouseleave', () => {
      preview.classList.remove('active');
      video.pause();
      video.src = "";
    });
  });
})();

/* ================= APEX STUDIOS SYNCHRONIZED PLAYBACK & SOUND CONTROL ================= */
(function() {
  const studiosSection = document.getElementById('studios-expanded');
  const portfolioContainer = document.querySelector('.cinematic-portfolio');
  const projectVideos = document.querySelectorAll('.cinematic-project-video');
  const soundBtn = document.getElementById('studios-sound-btn');
  
  if (!studiosSection || !projectVideos.length) return;

  // Initialize videos with required attributes
  projectVideos.forEach(video => {
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
  });

  // Sound preference state
  let soundEnabled = localStorage.getItem('apex-studios-sound') === 'on';

  // Function to update sound UI and video volume/muted states
  function updateSoundUI() {
    if (soundBtn) {
      const icon = soundBtn.querySelector('.sound-icon');
      const text = soundBtn.querySelector('.sound-text');
      if (soundEnabled) {
        soundBtn.classList.add('sound-on');
        if (icon) icon.textContent = '🔊';
        if (text) text.textContent = 'Sound On';
      } else {
        soundBtn.classList.remove('sound-on');
        if (icon) icon.textContent = '🔇';
        if (text) text.textContent = 'Sound Off';
      }
    }
    projectVideos.forEach(video => {
      video.muted = !soundEnabled;
    });
  }

  // Handle user toggle click
  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      localStorage.setItem('apex-studios-sound', soundEnabled ? 'on' : 'off');
      updateSoundUI();
    });
  }

  // Attempt to apply saved sound preference on first allowed user gesture
  function applySavedPreference() {
    if (soundEnabled) {
      projectVideos.forEach(video => {
        video.muted = false;
      });
    }
    window.removeEventListener('click', applySavedPreference);
    window.removeEventListener('touchstart', applySavedPreference);
  }
  if (soundEnabled) {
    window.addEventListener('click', applySavedPreference);
    window.addEventListener('touchstart', applySavedPreference);
  }

  // Apply initial mute/unmute state based on preference (default muted to satisfy autoplay policy)
  updateSoundUI();

  // Video synchronization loop
  let syncInterval = null;

  function startSyncCheck() {
    if (syncInterval) return;
    syncInterval = setInterval(() => {
      const activeVideos = Array.from(projectVideos).filter(v => !v.paused && v.readyState >= 2);
      if (activeVideos.length === 0) return;

      const leadVideo = activeVideos[0];
      const leadTime = leadVideo.currentTime;

      projectVideos.forEach(video => {
        if (video === leadVideo) return;
        if (video.paused) return;

        if (video.duration && leadVideo.duration && !isNaN(video.duration) && !isNaN(leadVideo.duration)) {
          const targetTime = leadTime % video.duration;
          const diff = Math.abs(video.currentTime - targetTime);
          if (diff > 0.25) {
            video.currentTime = targetTime;
          }
        } else {
          const diff = Math.abs(video.currentTime - leadTime);
          if (diff > 0.25) {
            video.currentTime = leadTime;
          }
        }
      });
    }, 1000);
  }

  function stopSyncCheck() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  // Playback control functions
  function playAllVideos() {
    projectVideos.forEach(video => {
      if (video.paused) {
        video.play().catch(err => {
          // Silent catch for initial blocked autoplays
        });
      }
    });
    startSyncCheck();
  }

  function pauseAllVideos() {
    projectVideos.forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
    stopSyncCheck();
  }

  // Intersection Observer
  // Using 0.4 threshold. Since sections can be very tall, we also observe portfolioContainer.
  const observer = new IntersectionObserver((entries) => {
    let shouldPlay = false;
    entries.forEach(entry => {
      if (entry.intersectionRatio >= 0.4) {
        shouldPlay = true;
      }
    });
    if (shouldPlay) {
      playAllVideos();
    } else {
      // Check if both elements are below threshold before pausing
      const studiosRect = studiosSection.getBoundingClientRect();
      const portfolioRect = portfolioContainer ? portfolioContainer.getBoundingClientRect() : null;
      
      const vh = window.innerHeight;
      
      // Calculate intersection ratio of studiosSection manually
      const studiosVisibleHeight = Math.max(0, Math.min(studiosRect.bottom, vh) - Math.max(studiosRect.top, 0));
      const studiosRatio = studiosVisibleHeight / studiosRect.height;

      // Calculate intersection ratio of portfolioContainer manually
      let portfolioRatio = 0;
      if (portfolioRect) {
        const portfolioVisibleHeight = Math.max(0, Math.min(portfolioRect.bottom, vh) - Math.max(portfolioRect.top, 0));
        portfolioRatio = portfolioVisibleHeight / portfolioRect.height;
      }

      if (studiosRatio < 0.4 && portfolioRatio < 0.4) {
        pauseAllVideos();
      } else {
        playAllVideos();
      }
    }
  }, {
    threshold: [0.0, 0.4, 1.0]
  });

  observer.observe(studiosSection);
  if (portfolioContainer) {
    observer.observe(portfolioContainer);
  }
})();

/* ================= WATERMARK SCROLL ANIMATION ================= */
(function() {
  const watermarks = document.querySelectorAll('.apex-watermark, .footer-watermark');
  if (!watermarks.length) return;

  const watermarkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          entry.target.classList.remove('active');
        }
      });
    },
    { threshold: 0.1 }
  );

  watermarks.forEach(el => watermarkObserver.observe(el));
})();

/* ================= WORK GRID COMPONENT (HOVER TO PLAY) ================= */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".work-card");

  cards.forEach((card) => {
    const video = card.querySelector("video");
    const toggleBtn = card.querySelector(".card-action-btn");

    if (!video) return;

    // Hover-to-play functionality
    card.addEventListener("mouseenter", () => {
      video.play().catch(() => {
        // Prevent audio/video play errors if autoplay is restricted
      });
    });

    card.addEventListener("mouseleave", () => {
      video.pause();
    });

    // Mute/Unmute toggle
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        video.muted = !video.muted;
        toggleBtn.textContent = video.muted ? "Unmute" : "Mute";
      });
    }
  });
});

/* ================= WORK SLIDER SECTION ================= */
document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll(".work-slider-section");
  
  sliders.forEach(slider => {
    const track = slider.querySelector(".slider-track");
    const progressFill = slider.querySelector(".progress-fill");
    
    // 1. Sync custom red progress bar with horizontal scroll position
    if (track && progressFill) {
      track.addEventListener("scroll", () => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll > 0) {
          const currentScroll = track.scrollLeft;
          const progress = (currentScroll / maxScroll) * 100;
          progressFill.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
        }
      });
    }

    const cards = slider.querySelectorAll(".slide-card");
    // 2. Play on hover and toggle sound per video card
    cards.forEach((card) => {
      const video = card.querySelector(".slide-video");
      const soundBtn = card.querySelector(".sound-toggle");

      if (!video) return;

      card.addEventListener("mouseenter", () => {
        video.currentTime = 0;
        video.play().catch(() => {
          // Fallback for browsers blocking auto-play
        });
      });

      card.addEventListener("mouseleave", () => {
        video.pause();
      });

      if (soundBtn) {
        soundBtn.addEventListener("click", () => {
          video.muted = !video.muted;
          soundBtn.textContent = video.muted ? "Unmute" : "Mute";
        });
      }
    });
  });
});

/* ================= AI CTA INTERACTIVE WORD STACK ANIMATION ================= */
document.addEventListener("DOMContentLoaded", () => {
  const shootWord = document.querySelector(".word-shoot, .word-shoot-base");
  const generateWord = document.querySelector(".word-generate, .word-generate-overlay");
  const container = document.querySelector(".word-overlay-container");

  if (shootWord && generateWord) {
    let hasTriggered = false;

    const triggerAnimation = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      shootWord.classList.add("struck");
      generateWord.classList.add("show");
    };

    // 1. Immediate Viewport Check
    const checkViewport = () => {
      const rect = (container || shootWord).getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.9 && rect.bottom >= 0) {
        triggerAnimation();
        return true;
      }
      return false;
    };

    if (!checkViewport()) {
      // 2. IntersectionObserver
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setTimeout(triggerAnimation, 200);
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.05 });

        observer.observe(container || shootWord);
      }

      // 3. Scroll Listener Fallback
      window.addEventListener("scroll", checkViewport, { passive: true });
    }

    // 4. Guaranteed Timer Fallback
    setTimeout(triggerAnimation, 800);

    // 5. Interactive Hover Re-trigger
    if (container) {
      container.addEventListener("mouseenter", () => {
        shootWord.classList.remove("struck");
        generateWord.classList.remove("show");
        void shootWord.offsetWidth; // Force reflow
        setTimeout(() => {
          shootWord.classList.add("struck");
          generateWord.classList.add("show");
        }, 50);
      });
    }
  }
});

/* ================= CINEMATIC YOUTUBE PORTFOLIO & LAZY MODAL ================= */

/**
 * Robust YouTube ID extractor algorithm
 * Parses 11-char IDs, youtu.be, youtube.com/watch, /shorts/, /embed/
 */
function extractYouTubeId(input) {
  const value = (input || "").trim();
  if (!value) return "";

  const rawIdMatch = value.match(/^[a-zA-Z0-9_-]{11}$/);
  if (rawIdMatch) return rawIdMatch[0];

  try {
    const url = new URL(value);
    const host = url.hostname.replace("www.", "");
    const path = url.pathname;

    if (host === "youtu.be") {
      const shortId = path.replace("/", "").split("?")[0];
      if (shortId) return shortId;
    }

    if (host.includes("youtube.com")) {
      if (path === "/watch") {
        const watchId = url.searchParams.get("v");
        if (watchId) return watchId;
      }
      if (path.startsWith("/shorts/")) {
        const shortsId = path.split("/shorts/")[1]?.split("/")[0];
        if (shortsId) return shortsId;
      }
      if (path.startsWith("/embed/")) {
        const embedId = path.split("/embed/")[1]?.split("/")[0];
        if (embedId) return embedId;
      }
    }
  } catch (error) {
    const fallback = value.match(/([a-zA-Z0-9_-]{11})/);
    return fallback?.[1] || "";
  }

  const fallback = value.match(/([a-zA-Z0-9_-]{11})/);
  return fallback?.[1] || "";
}

/**
 * CENTRALIZED PORTFOLIO DATA
 * Edit this array to add, update, or remove portfolio projects.
 */
const portfolioProjects = [
  {
    id: "mirai",
    title: "Mirai",
    description: "A futuristic cinematic vision generated through advanced AI production pipelines and synthetic world-building.",
    category: "AI FILM & CGI",
    year: "2026",
    duration: "01:42",
    youtubeUrl: "https://youtu.be/FKPkvtwIafQ",
    featured: true
  },
  {
    id: "silver-wolf",
    title: "The Silver Wolf",
    description: "An epic cinematic saga brought to life with hyper-realistic AI character consistency and dark atmospheric visual effects.",
    category: "CINEMATIC SHORTS",
    year: "2026",
    duration: "02:15",
    youtubeUrl: "https://youtu.be/7DxxaBfrLpk",
    featured: false
  },
  {
    id: "divine-arrival",
    title: "The Divine Arrival",
    description: "A majestic cinematic spectacle depicting celestial entities and transcendent visual storytelling.",
    category: "CGI INTEGRATION",
    year: "2026",
    duration: "01:58",
    youtubeUrl: "https://youtu.be/RhomGU7bI_Y",
    featured: false
  },
  {
    id: "mahabharat",
    title: "Mahabharat: Reimagined",
    description: "A grand mythological epic reimagined through next-generation generative AI rendering and cinematic scale.",
    category: "EPISODIC NARRATIVE",
    year: "2026",
    duration: "03:10",
    youtubeUrl: "https://youtu.be/P1FrJPZSXyU",
    featured: false
  }
];

// Track last active element for accessibility focus restoration
let lastActiveElement = null;

// Lazy YouTube Video Modal Controllers
function openVideoModal(youtubeUrlOrId, title) {
  const modal = document.getElementById('videoModal');
  if (!modal) return;

  const videoId = extractYouTubeId(youtubeUrlOrId) || youtubeUrlOrId;
  if (!videoId) return;

  // Track currently focused element to return focus after closing
  lastActiveElement = document.activeElement;

  const modalIframe = document.getElementById('modalIframe');
  const frame = document.getElementById('videoPlayerFrame');
  const originParam = (window.location.protocol.startsWith('http')) 
    ? `&origin=${encodeURIComponent(window.location.origin)}` 
    : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&color=white&iv_load_policy=3&autoplay=1${originParam}`;

  if (modalIframe) {
    modalIframe.src = embedUrl;
    if (title) modalIframe.title = title;
  } else if (frame) {
    frame.innerHTML = `<iframe id="modalIframe" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="${title || 'YouTube Video Player'}"></iframe>`;
  }

  // Activate Modal and Lock Background Scroll
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = modal.querySelector('.modal-close, .modal-close-btn');
  if (closeBtn) closeBtn.focus();
}

function closeVideoModal(e) {
  // If user clicked inside modal-content and NOT on modal-close button, do not close modal
  if (e && e.target && e.target.closest && e.target.closest('.modal-content') && !e.target.classList.contains('modal-close') && !e.target.closest('.modal-close')) {
    return;
  }

  const modal = document.getElementById('videoModal');
  const modalIframe = document.getElementById('modalIframe');

  if (modalIframe) {
    modalIframe.src = '';
  }

  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';

  // Accessibility: Return focus to trigger element
  if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
    try {
      lastActiveElement.focus();
    } catch (err) {}
  }
}

// Render Portfolio Function
function renderPortfolio() {
  const featuredContainer = document.getElementById('portfolio-featured');
  const gridContainer = document.getElementById('portfolio-grid');

  if (!featuredContainer || !gridContainer) return;

  // Identify featured project (first item with featured: true, or default to first item)
  const featuredProj = portfolioProjects.find(p => p.featured) || portfolioProjects[0];
  const gridProjects = portfolioProjects.filter(p => p.id !== featuredProj.id);

  const featuredId = extractYouTubeId(featuredProj.youtubeUrl);
  const featuredThumb = `https://i.ytimg.com/vi/${featuredId}/maxresdefault.jpg`;
  const featuredFallback = `https://img.youtube.com/vi/${featuredId}/hqdefault.jpg`;

  // Render Featured Project Card
  featuredContainer.innerHTML = `
    <article class="featured-project-card" tabindex="0" aria-label="Featured Project: ${featuredProj.title}">
      <div class="featured-thumb-container" onclick="openVideoModal('${featuredProj.youtubeUrl}', '${featuredProj.title}')">
        <img class="featured-thumb" 
             src="${featuredThumb}" 
             alt="${featuredProj.title} film thumbnail" 
             loading="eager"
             onerror="this.onerror=null; this.src='${featuredFallback}';">
        <div class="cinematic-overlay"></div>
        <button class="portfolio-play-btn magnetic" aria-label="Play ${featuredProj.title} video" onclick="openVideoModal('${featuredProj.youtubeUrl}', '${featuredProj.title}')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
      <div class="featured-info-panel">
        <div class="featured-badge-row">
          <span class="featured-badge mono">01 / FEATURED SPOTLIGHT</span>
          <span class="meta-tag mono">${featuredProj.category}</span>
        </div>
        <h3 class="featured-title" onclick="openVideoModal('${featuredProj.youtubeUrl}', '${featuredProj.title}')">${featuredProj.title}</h3>
        <div class="featured-meta-line mono">
          <span>${featuredProj.year}</span>
          <span class="sep">•</span>
          <span>${featuredProj.duration}</span>
        </div>
        <p class="featured-description">${featuredProj.description}</p>
        <button class="btn btn-primary portfolio-watch-cta" onclick="openVideoModal('${featuredProj.youtubeUrl}', '${featuredProj.title}')">
          <span>WATCH FILM</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
    </article>
  `;

  // Render Editorial Portfolio Grid
  gridContainer.innerHTML = gridProjects.map((proj, idx) => {
    const vId = extractYouTubeId(proj.youtubeUrl);
    const thumbUrl = `https://i.ytimg.com/vi/${vId}/maxresdefault.jpg`;
    const fallbackUrl = `https://img.youtube.com/vi/${vId}/hqdefault.jpg`;
    const itemNum = String(idx + 2).padStart(2, '0');

    return `
      <article class="portfolio-grid-card" tabindex="0" aria-label="Project: ${proj.title}">
        <div class="card-thumb-container" onclick="openVideoModal('${proj.youtubeUrl}', '${proj.title}')">
          <img class="card-thumb" 
               src="${thumbUrl}" 
               alt="${proj.title} thumbnail" 
               loading="lazy"
               onerror="this.onerror=null; this.src='${fallbackUrl}';">
          <div class="card-overlay"></div>
          <span class="card-num mono">${itemNum}</span>
          <div class="card-play-indicator" aria-hidden="true">
            <div class="play-triangle"></div>
          </div>
        </div>
        <div class="card-content">
          <div class="card-meta-row mono">
            <span>${proj.category}</span>
            <span class="sep">•</span>
            <span>${proj.year}</span>
            <span class="sep">•</span>
            <span>${proj.duration}</span>
          </div>
          <h4 class="card-title" onclick="openVideoModal('${proj.youtubeUrl}', '${proj.title}')">${proj.title}</h4>
          <p class="card-desc">${proj.description}</p>
        </div>
      </article>
    `;
  }).join('');
}

// Initialize Portfolio & Modal Listeners on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  renderPortfolio();

  // Content Lifecycle 7-second Auto Rotation & Hover Pause
  startLifecycleAutoRotate();
  const lifecycleWrapper = document.querySelector('.lifecycle-circular-wrapper, .lifecycle-circle');
  if (lifecycleWrapper) {
    lifecycleWrapper.addEventListener('mouseenter', () => {
      if (lifecycleInterval) clearInterval(lifecycleInterval);
    });
    lifecycleWrapper.addEventListener('mouseleave', () => {
      startLifecycleAutoRotate();
    });
  }

  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('closeVideoModalBtn');

  if (backdrop) backdrop.addEventListener('click', closeVideoModal);
  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);

  // Keyboard Navigation: Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
    }
  });
});
