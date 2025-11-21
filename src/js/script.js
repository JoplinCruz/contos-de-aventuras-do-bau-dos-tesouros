const cardContainer = document.getElementById("card-container");
const seeker = document.querySelector("#seeker");
const searchTerm = document.getElementById("search-term");

seeker.addEventListener("submit", searcher);

const databasePath = "src/db/database.json";
const database = [];

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

async function searcher(event) {
  event.preventDefault();

  if (!database.length) {
    await getDatabase();
  }

  let term = searchTerm.value.toLowerCase();
  let filteredDatabase = database.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      item.company.toLowerCase().includes(term) ||
      item.since.toString().includes(term) ||
      item.console.some((consoleName) =>
        consoleName.toLowerCase().includes(term)
      ) ||
      item.description.toLowerCase().includes(term)
  );

  cardRender(filteredDatabase);
}

function formatConsoleList(consoles) {
  const formatter = new Intl.ListFormat("pt-BR", {
    style: "long",
    type: "conjunction",
  });
  return formatter.format(consoles);
}

function cardRender(database) {
  cardContainer.innerHTML = "";

  for (let data of database) {
    let article = document.createElement("article");
    let title =
      data.title.toLowerCase() === "pacman"
        ? `<a href="https://pacman-three-green.vercel.app/" target="_blank" style="text-decoration: none;">${data.title}</a>`
        : data.title;
    article.classList.add("card");
    article.innerHTML = `
      <div class="cover">
        <img src="${
          data.img
        }" height="96px" alt="cover of ${data.title.toLowerCase()}" />
      </div>
      <div class="info">
        <h2>${title}</h2>
        <p>produtora: <span class="highlight"><strong>${
          data.company
        }</strong>.</span></p>
        <p>lançamento: <span class="highlight">${data.since}.</span></p>
        <p>console: <span class="highlight">${formatConsoleList(
          data.console
        )}.</span></p>
        <p>sinopse: <span class="highlight">${data.description}</span></p>
        <a href="${
          data.url
        }" target="_blank"><span class="highlight">saiba mais sobre ${
      data.title
    }...</span></a>
      </div>
    `;

    cardContainer.appendChild(article);
  }
}

window.onload = async () => {
  await getDatabase();
  cardRender(database);
};
