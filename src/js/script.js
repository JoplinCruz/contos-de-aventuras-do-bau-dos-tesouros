const cardContainer = document.querySelector("#card__container"); // tag container para os cards
const floatingContainer = document.querySelector("#floating__container"); // tag container para ocard flutuante
const searchContainer = document.querySelector("#search__container"); //tag cantainer para o formulário de entrada
const searchInput = document.querySelector("#search-input"); // tag de entrada para capturar o contexto da busca

searchContainer.addEventListener("submit", searcher); // ao teclar enter ou clicar no botão de busca chama a função searcher

// inicialização do banco de dados
const databasePath = "src/db/gameDatabase.json";
const database = [];

// função para requerimento de dados para alocação na memória
async function getDatabase() {
  try {
    let response = await fetch(databasePath);

    if (!response.ok) throw new Error("Failed to fecth database");
    let result = await response.json();

    if (Array.isArray(result)) database.push(...result);
    else database.push(result);
  } catch (error) {
    console.error(`Error: ${error}`);
    return;
  }
}

// função de busca de dados de contexto segundo o termo inserido
async function searcher(event) {
  event.preventDefault();

  if (!database.length) {
    await getDatabase();
  }

  let term = searchInput.value.toLowerCase();
  let filteredDatabase = database.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      item.company.toLowerCase().includes(term) ||
      item.since.includes(term) ||
      item.consoles.some((consoleName) =>
        consoleName.toLowerCase().includes(term)
      ) ||
      item.description.toLowerCase().includes(term) ||
      item.tags.some((tag) => tag.toLowerCase().includes(term))
  );

  cardRender(filteredDatabase);
}

// função para adicionar link do game ao título caso esteja disponível
function addTitleLink(title, link) {
  return `<a href="${link}" target="_blank" style="text-decoration: none;">${title}</a>`;
}

// função para formatar um array em text conjuntivo (ex: ["Atari", "Commodore 64", "MSX"] => "Atari, Commodore 64 e MSX")
// honestamente eu desconhecia essa função ( Intl ), mas quando o gemini me apresentou achei muito incrível
function formatConsoleList(consoles) {
  const formatter = new Intl.ListFormat("pt-BR", {
    style: "long",
    type: "conjunction",
  });
  return formatter.format(consoles);
}

// função para formatar os dados que serão inseridos no cardContainer
// esse recurso foi criado para formatar o conteúdo estruturção do card
// já que ele é construído em dois momentos diferentes
// quando rederizamos na tela inicial e quando o cardo é clicado
function formatInnerContent(card) {
  let title = card.play ? addTitleLink(card.title, card.play) : card.title,
    image = card.img,
    alt = card.title.toLowerCase(),
    company = card.company,
    since = card.since,
    consoles = formatConsoleList(card.consoles),
    description = card.description,
    link = card.url;

  return [
    `<img src="${image}" alt="cover of ${alt}" />`,
    `<h2>${title}</h2>`,
    `
    <p>produtora: <span><strong>${company}</strong>.</span></p>
    <p>lançamento: <span>${since}.</span></p>
    <p>console: <span>${consoles}.</span></p>
    <p>sinopse: <span>${description}</span></p>
    <a href="${link}" target="_blank"><span>saiba mais sobre ${card.title}...</span></a>`,
  ];
}

// função que extrai os dados do card quando esse é clicado, através do id
function getCardFromClick(event) {
  let path = event.composedPath();
  let id = path.filter(
    (tag) => tag.nodeType === Node.ELEMENT_NODE && tag.className === "card"
  )[0].id;

  let card = database.filter((gameCard) => gameCard.id === Number(id))[0];

  cardSelectedRender(card);
}

// função que renderiza os cards na tela
function cardRender(database) {
  cardContainer.innerHTML = "";

  for (let card of database) {
    let article = document.createElement("article");
    let [image, title, description] = formatInnerContent(card);

    article.classList.add("card");
    article.id = card.id;
    article.innerHTML = `
      <div class="cover">
        ${image}
      </div>
      <div class="info">
        ${title}
        ${description}
      </div>
    `;
    // aqui atribuímos um evento de escuta para capturar os dados do card clicado
    article.addEventListener("click", getCardFromClick);

    cardContainer.appendChild(article);
  }
}

// função para remover os eventos do caRD FLUTUANTE
function cardSelectedEscape(event) {
  // verifica se a tecla pressionada é diferente de escape, retornando nulo
  if (event.type === "keydown" && event.key !== "Escape") return;
  // verifica se o clique do mouse é dentro do card flutuante, retornando nulo
  if (event.type === "click" && event.target.className !== "floating-bg")
    return;

  // remove os eventos de tecla pressionada e clique do mouse
  floatingContainer.innerHTML = "";
  window.removeEventListener("keydown", cardSelectedEscape);
}

// função que renderiza o card flutuante quando ele é clicado no meio da lista
function cardSelectedRender(card) {
  let [image, title, description] = formatInnerContent(card);

  let div = document.createElement("div");
  div.classList.add("floating-bg");
  div.innerHTML = `
    <div class="floating-card">
      <div class="floating-head">
        <div class="cover">${image}</div>
        <div class="title">${title}</div>
      </div>
      <div class="description">${description}</div>
    </div>`;

  floatingContainer.appendChild(div);

  div.addEventListener("click", cardSelectedEscape);
  window.addEventListener("keydown", cardSelectedEscape);

  return;
}

// inicializa a base de dados na memória, renderizando todos os cards na tela
window.onload = async () => {
  await getDatabase();
  cardRender(database);
};
