const state = { category: null, technology: null, projects: [] };
const $ = (selector) => document.querySelector(selector);

async function loadProjects() {
  const response = await fetch('projects.json');
  if (!response.ok) throw new Error('Could not load project data');
  state.projects = await response.json();
  $('#project-count').textContent = state.projects.filter((project) => project.featured).length;
  buildFilters();
  renderProjects();
}

function uniqueValues(key) {
  return [...new Set(state.projects.flatMap((project) => project[key]))].sort();
}

function buildFilters() {
  createFilterButtons($('#category-filters'), uniqueValues('categories'), 'category');
  createFilterButtons($('#technology-filters'), uniqueValues('technologies'), 'technology');
}

function createFilterButtons(container, values, key) {
  values.forEach((value) => {
    const button = document.createElement('button');
    button.className = 'filter';
    button.type = 'button';
    button.textContent = value;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      state[key] = state[key] === value ? null : value;
      container.querySelectorAll('.filter').forEach((item) => item.setAttribute('aria-pressed', String(item.textContent === state[key])));
      renderProjects();
    });
    container.append(button);
  });
}

function visibleProjects() {
  return state.projects.filter((project) =>
    (!state.category || project.categories.includes(state.category)) &&
    (!state.technology || project.technologies.includes(state.technology))
  );
}

function renderProjects() {
  const grid = $('#project-grid');
  const projects = visibleProjects();
  grid.replaceChildren();
  $('#empty-state').hidden = projects.length > 0;
  projects.forEach((project) => grid.append(createCard(project)));
}

function createCard(project) {
  const article = document.createElement('article');
  article.className = 'card';
  article.innerHTML = `<img class="card-image" src="${project.image}" alt="${project.name} project illustration"><div class="card-body"><div class="card-top"><h3>${project.name}</h3><span class="status">${project.status}</span></div><p>${project.summary}</p><div class="tags">${project.technologies.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div><div class="card-actions"><a class="action" href="${project.repositoryUrl}" target="_blank" rel="noreferrer">Repository ↗</a>${project.demoUrl ? `<a class="action" href="${project.demoUrl}" target="_blank" rel="noreferrer">Live demo ↗</a>` : ''}<button class="details" type="button">Details</button></div></div>`;
  article.querySelector('.details').addEventListener('click', () => showDetails(project));
  return article;
}

function showDetails(project) {
  $('#dialog-image').src = project.image;
  $('#dialog-image').alt = `${project.name} project illustration`;
  $('#dialog-status').textContent = project.status;
  $('#dialog-title').textContent = project.name;
  $('#dialog-summary').textContent = project.summary;
  $('#dialog-architecture').textContent = project.architecture;
  const links = $('#dialog-links');
  links.replaceChildren();
  [ ['Repository', project.repositoryUrl], ['Live demo', project.demoUrl] ].filter(([, url]) => url).forEach(([label, url]) => {
    const link = document.createElement('a'); link.className = 'action'; link.href = url; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = `${label} ↗`; links.append(link);
  });
  $('#project-dialog').showModal();
}

function clearFilters() {
  state.category = null; state.technology = null;
  document.querySelectorAll('.filter').forEach((button) => button.setAttribute('aria-pressed', 'false'));
  renderProjects();
}

$('#clear-filters').addEventListener('click', clearFilters);
$('#empty-clear').addEventListener('click', clearFilters);
$('.dialog-close').addEventListener('click', () => $('#project-dialog').close());
$('#project-dialog').addEventListener('click', (event) => { if (event.target === $('#project-dialog')) $('#project-dialog').close(); });
loadProjects().catch((error) => { $('#project-grid').innerHTML = `<p class="empty">Project data could not be loaded. Please try again.</p>`; console.error(error); });
