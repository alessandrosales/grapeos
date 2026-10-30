const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const heroVideo = document.querySelector('.hero-video');

if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const loadHeroVideo = () => {
    if (heroVideo.src) return;
    heroVideo.src = heroVideo.dataset.src;
    heroVideo.load();
    heroVideo.play().catch(() => {});
  };

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadHeroVideo();
        videoObserver.disconnect();
      }
    }, { rootMargin: '200px' });
    videoObserver.observe(heroVideo);
  } else {
    loadHeroVideo();
  }
}

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12), { passive: true });

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.querySelector('iconify-icon').setAttribute('icon', open ? 'lucide:menu' : 'lucide:x');
  nav.classList.toggle('open', !open);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.querySelector('iconify-icon').setAttribute('icon', 'lucide:menu');
}));

const teams = {
  dev: { kicker: 'DESENVOLVIMENTO', title: 'Da demanda ao código, com uma equipe pronta para colaborar.', description: 'Apoio na construção de sistemas, implementação de funcionalidades, correção de bugs e atividades de suporte técnico.', objective: 'Objetivo da semana', agents: ['lucide:code-2', 'lucide:panels-top-left', 'lucide:circle-check-big'], labels: ['Backend', 'Frontend', 'Revisão'] },
  admin: { kicker: 'ADMINISTRATIVO', title: 'Rotinas organizadas para a operação ganhar ritmo.', description: 'Agentes ajudam a estruturar informações, acompanhar tarefas e preparar documentos para conferência.', objective: 'Organizar a rotina', agents: ['lucide:database', 'lucide:list-todo', 'lucide:circle-check-big'], labels: ['Dados', 'Rotinas', 'Conferência'] },
  finance: { kicker: 'FINANCEIRO', title: 'Informações preparadas para decisões mais bem acompanhadas.', description: 'Apoio à organização de rotinas financeiras, análise de informações e preparação de relatórios para conferência.', objective: 'Preparar relatório', agents: ['lucide:chart-no-axes-combined', 'lucide:file-spreadsheet', 'lucide:circle-check-big'], labels: ['Análise', 'Relatório', 'Conferência'] },
  marketing: { kicker: 'MARKETING', title: 'Pesquisa e conteúdo com uma operação mais constante.', description: 'Agentes ajudam a pesquisar temas, organizar demandas e produzir versões iniciais de materiais para aprovação.', objective: 'Planejar campanha', agents: ['lucide:search', 'lucide:pen-line', 'lucide:circle-check-big'], labels: ['Pesquisa', 'Conteúdo', 'Aprovação'] },
  legal: { kicker: 'JURÍDICO', title: 'Materiais organizados para a revisão responsável.', description: 'Apoio à análise preliminar de contratos e à organização documental, com revisão por profissionais habilitados.', objective: 'Organizar contratos', agents: ['lucide:files', 'lucide:scan-search', 'lucide:circle-check-big'], labels: ['Documentos', 'Análise', 'Revisão'] },
  support: { kicker: 'SUPORTE E OPERAÇÕES', title: 'Demandas recorrentes com fluxos mais bem definidos.', description: 'Equipes preparadas para auxiliar em demandas recorrentes de suporte e execução de processos definidos.', objective: 'Organizar chamados', agents: ['lucide:headphones', 'lucide:route', 'lucide:circle-check-big'], labels: ['Triagem', 'Execução', 'Retorno'] }
};

const tabs = document.querySelectorAll('[role="tab"]');
const teamKicker = document.querySelector('#team-kicker');
const teamTitle = document.querySelector('#team-title');
const teamDescription = document.querySelector('#team-description');
const diagram = document.querySelector('#team-diagram');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let orchestrationLines = [];
let orchestrationStarted = false;
let securityLines = [];
let securityStarted = false;
let lineTickerAdded = false;

function clearOrchestrationLines() {
  orchestrationLines.forEach((line) => line.remove());
  orchestrationLines = [];
  diagram?.classList.remove('orchestration-ready');
}

function positionOrchestrationLines() {
  orchestrationLines.forEach((line) => line.position());
  securityLines.forEach((line) => line.position());
}

function buildOrchestrationLines() {
  if (!diagram || !window.LeaderLine) {
    clearOrchestrationLines();
    return;
  }

  clearOrchestrationLines();
  const source = diagram.querySelector('[data-flow-source]');
  const nodes = [...diagram.querySelectorAll('[data-flow-node]')];
  const result = diagram.querySelector('[data-flow-result]');
  const isCompact = window.innerWidth < 768;
  const baseOptions = {
    color: '#6d42f7',
    size: isCompact ? 2.2 : 3,
    path: 'fluid',
    startPlug: 'disc',
    endPlug: 'arrow3',
    startPlugSize: 0.95,
    endPlugSize: 1.1,
    outline: true,
    outlineColor: 'rgba(255, 255, 255, 0.96)',
    outlineSize: 0.28,
    dropShadow: { color: 'rgba(91, 46, 230, 0.42)', dx: 0, dy: 2, blur: 5 },
    dash: false,
    hide: true
  };

  nodes.forEach((node, index) => {
    const gravity = (isCompact ? [-65, 0, 65] : [-160, 0, 160])[index];
    orchestrationLines.push(
      new LeaderLine(source, node, {
        ...baseOptions,
        startSocket: 'bottom',
        endSocket: 'top',
        startSocketGravity: [gravity, isCompact ? 70 : 115],
        endSocketGravity: [0, isCompact ? -55 : -85]
      }),
      new LeaderLine(node, result, {
        ...baseOptions,
        startSocket: 'bottom',
        endSocket: 'top',
        color: '#8f70ff',
        startSocketGravity: [0, isCompact ? 55 : 85],
        endSocketGravity: [gravity, isCompact ? -65 : -105]
      })
    );
  });
  diagram.classList.add('orchestration-ready');
}

function animateOrchestration({ restart = false } = {}) {
  if (!diagram || reducedMotion.matches) {
    orchestrationLines.forEach((line) => line.show('none'));
    return;
  }
  const source = diagram.querySelector('[data-flow-source]');
  const nodes = [...diagram.querySelectorAll('[data-flow-node]')];
  const result = diagram.querySelector('[data-flow-result]');
  const orbits = [...diagram.querySelectorAll('.diagram-orbit')];

  if (window.gsap) {
    if (restart) gsap.killTweensOf([source, ...nodes, result, ...orbits]);
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline.fromTo(source, { autoAlpha: 0, y: -14, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42 })
      .fromTo(nodes, { autoAlpha: 0, y: 15, scale: 0.82 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, stagger: 0.09 }, '-=0.12')
      .fromTo(result, { autoAlpha: 0, y: 12, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35 }, '-=0.1');
    gsap.to(nodes, { y: -4, duration: 2.2, ease: 'sine.inOut', stagger: 0.16, yoyo: true, repeat: -1, delay: 0.75 });
    gsap.to(orbits[0], { rotation: 7, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(orbits[1], { rotation: -6, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    if (!lineTickerAdded) {
      gsap.ticker.add(positionOrchestrationLines);
      lineTickerAdded = true;
    }
  }
  orchestrationLines.forEach((line) => line.show('draw', { duration: 520, timing: [0.2, 0.8, 0.2, 1] }));
}

function refreshOrchestration() {
  if (!diagram) return;
  if (window.gsap && !reducedMotion.matches) {
    gsap.fromTo(diagram, { opacity: 0.72 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
  }
  requestAnimationFrame(() => {
    positionOrchestrationLines();
    if (orchestrationStarted) animateOrchestration({ restart: true });
  });
}

const securityDiagram = document.querySelector('[data-security-diagram]');

function clearSecurityLines() {
  securityLines.forEach((line) => line.remove());
  securityLines = [];
}

function buildSecurityLines() {
  if (!securityDiagram || !window.LeaderLine) {
    clearSecurityLines();
    return;
  }

  clearSecurityLines();
  const core = securityDiagram.querySelector('[data-security-core]');
  const [company, channel] = securityDiagram.querySelectorAll('[data-security-target]');
  const isCompact = window.innerWidth < 768;
  const options = {
    color: '#c8b8ff',
    size: isCompact ? 2 : 2.5,
    path: 'fluid',
    startPlug: 'disc',
    endPlug: 'disc',
    startPlugSize: 0.9,
    endPlugSize: 0.9,
    outline: true,
    outlineColor: 'rgba(39, 29, 69, 0.95)',
    outlineSize: 0.34,
    dropShadow: { color: 'rgba(124, 77, 255, 0.56)', dx: 0, dy: 0, blur: 5 },
    dash: reducedMotion.matches ? false : { len: 5, gap: 8, animation: { duration: 1500, timing: 'linear' } },
    hide: true
  };

  securityLines = [
    new LeaderLine(core, company, { ...options, startSocket: 'left', endSocket: 'right', startSocketGravity: [isCompact ? -72 : -115, 0], endSocketGravity: [isCompact ? 62 : 100, 0] }),
    new LeaderLine(core, channel, { ...options, startSocket: 'right', endSocket: 'left', startSocketGravity: [isCompact ? 72 : 115, 0], endSocketGravity: [isCompact ? -62 : -100, 0] })
  ];
}

function animateSecurityDiagram({ restart = false } = {}) {
  if (!securityDiagram || reducedMotion.matches) {
    securityLines.forEach((line) => line.show('none'));
    return;
  }
  const core = securityDiagram.querySelector('[data-security-core]');
  const nodes = [...securityDiagram.querySelectorAll('[data-security-target]')];

  if (window.gsap) {
    if (restart) gsap.killTweensOf([core, ...nodes]);
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(core, { autoAlpha: 0, scale: 0.72 }, { autoAlpha: 1, scale: 1, duration: 0.48 })
      .fromTo(nodes, { autoAlpha: 0, y: 16, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.38 }, '-=0.18');
    gsap.to(core, { scale: 1.045, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.55 });
    gsap.to(nodes, { y: -4, duration: 2.6, ease: 'sine.inOut', stagger: 0.18, yoyo: true, repeat: -1, delay: 0.65 });
    if (!lineTickerAdded) {
      gsap.ticker.add(positionOrchestrationLines);
      lineTickerAdded = true;
    }
  }
  securityLines.forEach((line) => line.show('draw', { duration: 560, timing: [0.2, 0.8, 0.2, 1] }));
}

window.addEventListener('load', () => {
  buildOrchestrationLines();
  buildSecurityLines();

  if (diagram) {
    const orchestrationObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || orchestrationStarted) return;
      orchestrationStarted = true;
      animateOrchestration();
      orchestrationObserver.disconnect();
    }, { threshold: 0.3 });
    orchestrationObserver.observe(diagram);
  }

  if (securityDiagram) {
    const securityObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || securityStarted) return;
      securityStarted = true;
      animateSecurityDiagram();
      securityObserver.disconnect();
    }, { threshold: 0.3 });
    securityObserver.observe(securityDiagram);
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    buildOrchestrationLines();
    buildSecurityLines();
    if (orchestrationStarted) animateOrchestration({ restart: true });
    if (securityStarted) animateSecurityDiagram({ restart: true });
  }, 150);
});

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    const team = teams[tab.dataset.team];
    tabs.forEach((item) => item.setAttribute('aria-selected', 'false'));
    tab.setAttribute('aria-selected', 'true');
    teamKicker.textContent = team.kicker;
    teamTitle.textContent = team.title;
    teamDescription.textContent = team.description;
    diagram.querySelector('.diagram-main').innerHTML = `${team.objective} <b><iconify-icon icon="lucide:target" aria-hidden="true"></iconify-icon></b>`;
    [...diagram.querySelectorAll('.diagram-nodes span')].forEach((node, item) => {
      node.innerHTML = `<iconify-icon icon="${team.agents[item]}" aria-hidden="true"></iconify-icon><small>${team.labels[item]}</small>`;
    });
    refreshOrchestration();
  });
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].focus();
  });
});

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const productivityChartContainer = document.querySelector('[data-productivity-chart]');
let productivityChart;

function createProductivityChart() {
  if (!productivityChartContainer || productivityChart || !window.Chart) return;
  const canvas = document.querySelector('#productivity-chart-canvas');
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, 'rgba(167, 139, 250, 0.55)');
  gradient.addColorStop(1, 'rgba(124, 77, 255, 0)');

  productivityChart = new Chart(context, {
    type: 'line',
    data: {
      labels: ['Objetivo', 'Plano', 'Execução', 'Revisão', 'Entrega'],
      datasets: [{
        data: [18, 34, 48, 64, 86],
        borderColor: '#bfaaff',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.42,
        pointRadius: 3.5,
        pointHoverRadius: 3.5,
        pointBackgroundColor: '#1f1f29',
        pointBorderColor: '#d9ccff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion.matches ? false : { duration: 1400, easing: 'easeOutQuart' },
      interaction: { intersect: false },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#c8c0dc', font: { size: 9, weight: '600' }, padding: 9, maxRotation: 0 } },
        y: { display: false, min: 0, max: 100 }
      }
    }
  });
}

if (productivityChartContainer) {
  const chartObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    if (window.gsap && !reducedMotion.matches) {
      gsap.set(productivityChartContainer, { autoAlpha: 0, y: 18, scale: 0.96 });
      gsap.to(productivityChartContainer, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
      gsap.to(productivityChartContainer.querySelector('.chart-pulse'), { scale: 1.65, opacity: 0.35, duration: 1.25, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
    createProductivityChart();
    chartObserver.disconnect();
  }, { threshold: 0.35 });
  chartObserver.observe(productivityChartContainer);
}

const cookieBanner = document.querySelector('.cookie-banner');
const cookieConsentKey = 'grapeos-cookie-consent';
const campaignStorageKey = 'grapeos-campaign';
const campaignClickIds = new Set(['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id']);
const campaignFromUrl = {};

for (const [key, value] of new URLSearchParams(window.location.search)) {
  const name = key.toLowerCase();
  if (value && (/^utm_[a-z0-9_]+$/.test(name) || campaignClickIds.has(name))) {
    campaignFromUrl[name] = value;
  }
}

let campaign = campaignFromUrl;
try {
  if (window.localStorage.getItem(cookieConsentKey) === 'all') {
    if (Object.keys(campaignFromUrl).length) {
      window.sessionStorage.setItem(campaignStorageKey, JSON.stringify(campaignFromUrl));
    } else {
      const storedCampaign = JSON.parse(window.sessionStorage.getItem(campaignStorageKey) || '{}');
      if (storedCampaign && typeof storedCampaign === 'object' && !Array.isArray(storedCampaign)) {
        campaign = storedCampaign;
      }
    }
  } else {
    window.sessionStorage.removeItem(campaignStorageKey);
  }
} catch {
  // Campaign parameters from the current URL remain available if storage is blocked.
}

if (cookieBanner) {
  try {
    const savedConsent = window.localStorage.getItem(cookieConsentKey);
    if (!savedConsent) cookieBanner.hidden = false;
    else document.documentElement.dataset.cookieConsent = savedConsent;
  } catch {
    cookieBanner.hidden = false;
  }

  cookieBanner.querySelectorAll('[data-cookie-consent]').forEach((button) => {
    button.addEventListener('click', () => {
      const consent = button.dataset.cookieConsent;
      try { window.localStorage.setItem(cookieConsentKey, consent); } catch {}
      try {
        if (consent === 'all' && Object.keys(campaign).length) {
          window.sessionStorage.setItem(campaignStorageKey, JSON.stringify(campaign));
        } else {
          window.sessionStorage.removeItem(campaignStorageKey);
        }
      } catch {}
      document.documentElement.dataset.cookieConsent = consent;
      cookieBanner.hidden = true;
    });
  });
}

const form = document.querySelector('.lead-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = form.querySelector('.form-status');
  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  status.textContent = 'Enviando sua solicitação...';

  try {
    const data = new URLSearchParams(new FormData(form));
    for (const [key, value] of Object.entries(campaign)) {
      if (!data.has(key)) data.append(key, value);
    }
    const response = await fetch('https://n8n.saltfix.com.br/webhook/leads-landing-integracoes', {
      method: 'POST',
      body: data
    });
    if (!response.ok) throw new Error('Falha no envio');
    form.reset();
    status.textContent = 'Solicitação enviada! Entraremos em contato em breve.';
  } catch {
    status.textContent = 'Não foi possível enviar sua solicitação. Tente novamente.';
  } finally {
    submitButton.disabled = false;
  }
});
