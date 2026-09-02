const state = { category: '', technology: '', search: '', projects: [] };
const $ = (selector) => document.querySelector(selector);

async function loadProjects() {
  const response = await fetch('projects.json');
  if (!response.ok) throw new Error('Could not load project data');
  state.projects = shuffle(await response.json());
  $('#project-count').textContent = state.projects.length;
  buildFilters();
  renderProjects();
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function uniqueValues(key) {
  return [...new Set(state.projects.flatMap((project) => project[key]))].sort();
}

function buildFilters() {
  const categoryFilter = $('#category-filter');
  const technologyFilter = $('#technology-filter');
  uniqueValues('categories').forEach((value) => categoryFilter.append(new Option(value, value)));
  uniqueValues('technologies').forEach((value) => technologyFilter.append(new Option(value, value)));
  categoryFilter.addEventListener('change', (event) => { state.category = event.target.value; renderProjects(); });
  technologyFilter.addEventListener('change', (event) => { state.technology = event.target.value; renderProjects(); });
  $('#project-search').addEventListener('input', (event) => { state.search = event.target.value.trim().toLowerCase(); renderProjects(); });
}

function visibleProjects() {
  const matches = state.projects.filter((project) =>
    (!state.category || project.categories.includes(state.category)) &&
    (!state.technology || project.technologies.includes(state.technology)) &&
    (!state.search || `${project.name} ${project.summary} ${project.categories.join(' ')} ${project.technologies.join(' ')}`.toLowerCase().includes(state.search))
  );
  return state.category || state.technology || state.search ? matches : matches.slice(0, 4);
}

function renderProjects() {
  const grid = $('#project-grid');
  const projects = visibleProjects();
  grid.replaceChildren();
  $('#empty-state').hidden = projects.length > 0;
  projects.forEach((project, index) => grid.append(createCard(project, index)));
}

function createCard(project, index) {
  const article = document.createElement('article');
  article.className = 'card';
  article.style.setProperty('--card-index', index);
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
  state.category = ''; state.technology = ''; state.search = ''; state.projects = shuffle(state.projects);
  $('#category-filter').value = ''; $('#technology-filter').value = ''; $('#project-search').value = '';
  renderProjects();
}

$('#clear-filters').addEventListener('click', clearFilters);
$('#empty-clear').addEventListener('click', clearFilters);
$('.dialog-close').addEventListener('click', () => $('#project-dialog').close());
$('#project-dialog').addEventListener('click', (event) => { if (event.target === $('#project-dialog')) $('#project-dialog').close(); });
loadProjects().catch((error) => { $('#project-grid').innerHTML = `<p class="empty">Project data could not be loaded. Please try again.</p>`; console.error(error); });
