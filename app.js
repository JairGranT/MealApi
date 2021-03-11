const searchBar = document.querySelector('#searchBar');
const searchButton = document.querySelector('#searchButton');
const searchResults = document.querySelector('#results');
const pageContent = document.querySelector('#content');
searchButton.addEventListener('click', searchManager);

//Listens for clicks on the overlay of each card image
pageContent.addEventListener('click', async(e) =>{
    if (e.target.classList.contains('overlay')) {
        const recipeId = e.target.parentElement.getAttribute('data-value');
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
        const recipe = await apiCall(apiUrl)
                        .then(res => res.meals[0]);
        renderRecipe(recipe);
    }
});

//Uses the searchbar input to fetch the recipes
async function searchManager(){
    let searchInput = searchBar.value.trim();
    if (searchInput) {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput}`;
        let recipeData = await apiCall(apiUrl);
        renderRecipeCards(recipeData, searchInput);
    }
}

async function apiCall(apiUrl) {
    try {
        let res = await fetch(apiUrl);
        let data = await res.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}

//Display the cards with each recipe
function renderRecipeCards ({meals}, searchInput) {
    if (meals) {
        searchResults.innerHTML = `
        <div class="col">
          <h3>There are ${meals.length} results for ${searchInput} </h3>
        </div>
        `;
        pageContent.innerHTML = `
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 g-5 mt-1 mx-2">
            ${meals.map(recipe => `
                <div class="col d-flex">
                    <div class="card">
                        <div class="img-container" data-value="${recipe.idMeal}">
                            <img class="card-img-top" src="${recipe.strMealThumb}" alt="Card image cap">
                            <div class="overlay">
                                <h3>${recipe.strMeal}</h3>
                            </div>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${recipe.strMeal}</h5>
                            <div class="row-cols-auto mb-2">
                                ${ingredientBadges(recipe)}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        `;
    }else {
        searchResults.innerHTML = `
        <div class="col">
          <h3>There are no recipes that match your search</h3>
        </div>
        `;
        pageContent.innerHTML = '';
    }
}

//Display the info of the recipe
const renderRecipe = (recipe)=> {
    pageContent.innerHTML = `
    <div class="row d-flex justify-content-center text-center">
        <div class="col-12 text-center">
            <h1>${recipe.strMeal}</h1>
        </div>
        <div class="ratio ratio-16x9 my-4">
            <iframe class="embed-responsive-item" src="${embedUrl(recipe.strYoutube)}" allowfullscreen="true"></iframe>
        </div>
    </div>
    <div class="row my-4">
        <div class="col-12">
            ${ingredientBadges(recipe)}
        </div>
    </div>
    <div class="row">
        <div class="col-12 col-md-8">
            <p class="text">${recipe.strInstructions}</p>
        </div>
    </div>
    `;
    searchResults.innerHTML = '';
}

//Transforms the video url provided by TheMealDB to an embed youtube url.
const embedUrl = (youtubeUrl) => {
    const videoId = youtubeUrl.split('=')[1];
    let embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return embedUrl;
}

//Generates badges with the ingredients of the recipe
const ingredientBadges = (recipe) => {
    let ingredients = [];
    let measures = [];
    let badges = '';

    for (const [key, value] of Object.entries(recipe)) {
        if (key.includes('strIngredient') && value) {
            ingredients.push(value);
        }
    }
    
    for (const [key, value] of Object.entries(recipe)) {
        if (key.includes('strMeasure') && value) {
            measures.push(value);
        }
    }
    
    let ingredientsMeasures = measures.reduce((result, value, index) =>{
        result[ingredients[index]] = value;
        return result;
    }, {});

    for (const [key, value] of Object.entries(ingredientsMeasures)) {
        badges += `<span class="badge bg-primary m-1">${key + ', ' + value}</span>`;
    }

    return badges;
}
