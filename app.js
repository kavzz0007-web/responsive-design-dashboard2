// @ts-nocheck

"use strict";

/* =========================================================
   TASK 05
   Dynamic JavaScript DOM Logic & RESTful API Client

   Features:
   ✓ REST API
   ✓ Fetch API
   ✓ Async / Await
   ✓ Dynamic DOM
   ✓ Search
   ✓ Category filtering
   ✓ Sorting
   ✓ LocalStorage
   ✓ Cart state
   ✓ Loading skeleton
   ✓ Error handling
   ✓ Dark / Light theme
   ========================================================= */


/* =========================================================
   API
   ========================================================= */

const API_URL =
    "https://fakestoreapi.com/products";


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let products = [];

let cart = [];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const productGrid =
    document.getElementById("productGrid");

const categoryTabs =
    document.getElementById("categoryTabs");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const productCount =
    document.getElementById("productCount");

const loadingGrid =
    document.getElementById("loadingGrid");

const emptyState =
    document.getElementById("emptyState");

const cartCount =
    document.getElementById("cartCount");

const themeToggle =
    document.getElementById("themeToggle");


/* =========================================================
   LOCAL STORAGE - CART
   ========================================================= */

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem("cart");

        if (savedCart) {

            const parsedCart =
                JSON.parse(savedCart);

            if (Array.isArray(parsedCart)) {

                cart = parsedCart;

            } else {

                cart = [];

            }

        } else {

            cart = [];

        }

    } catch (error) {

        console.error(
            "Unable to load cart:",
            error
        );

        cart = [];
    }
}


function saveCart() {

    try {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "Unable to save cart:",
            error
        );
    }
}


/* =========================================================
   LOAD PRODUCTS FROM REST API
   ========================================================= */

async function loadProducts() {

    showLoading();

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "API request failed"
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid API response"
            );
        }

        products = data;

        createCategories();

        displayProducts(products);

        updateCart();

    } catch (error) {

        console.error(
            "Product API Error:",
            error
        );

        showError();

    } finally {

        hideLoading();
    }
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showLoading() {

    if (loadingGrid) {

        loadingGrid.classList.remove(
            "hidden"
        );
    }

    if (productGrid) {

        productGrid.innerHTML = "";
    }

    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );
    }
}


function hideLoading() {

    if (loadingGrid) {

        loadingGrid.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showError() {

    if (!productGrid) {
        return;
    }

    productGrid.innerHTML = `
        <div class="error-box">

            <h3>
                ⚠️ Unable to load products
            </h3>

            <p>
                Something went wrong while
                connecting to the product API.
            </p>

            <button
                id="retryButton"
                type="button"
            >
                Try Again
            </button>

        </div>
    `;

    const retryButton =
        document.getElementById(
            "retryButton"
        );

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadProducts
        );
    }
}


/* =========================================================
   DISPLAY PRODUCTS
   ========================================================= */

function displayProducts(list) {

    if (!productGrid) {
        return;
    }

    productGrid.innerHTML = "";

    if (productCount) {

        productCount.textContent =
            String(list.length);
    }


    if (list.length === 0) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );
        }

        return;
    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );
    }


    list.forEach(function(product) {

        const card =
            createProductCard(product);

        productGrid.appendChild(card);

    });
}


/* =========================================================
   CREATE PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "product-card";


    const title =
        escapeHTML(
            product.title ||
            "Product"
        );


    const category =
        escapeHTML(
            product.category ||
            "General"
        );


    const image =
        escapeHTML(
            product.image ||
            ""
        );


    const price =
        Number(product.price) || 0;


    let rating = 0;


    if (
        product.rating &&
        typeof product.rating.rate === "number"
    ) {

        rating =
            product.rating.rate;
    }


    card.innerHTML = `

        <div class="product-image">

            <img
                src="${image}"
                alt="${title}"
                loading="lazy"
            >

        </div>


        <div class="product-content">

            <span class="product-category">
                ${category}
            </span>


            <h3>
                ${title}
            </h3>


            <div class="rating">
                ⭐ ${rating.toFixed(1)}
            </div>


            <div class="product-bottom">

                <strong class="price">
                    $${price.toFixed(2)}
                </strong>


                <button
                    class="add-btn"
                    type="button"
                >
                    Add to Cart
                </button>

            </div>

        </div>

    `;


    const addButton =
        card.querySelector(
            ".add-btn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            function() {

                addToCart(product);

            }
        );
    }


    return card;
}


/* =========================================================
   CATEGORY CREATION
   ========================================================= */

function createCategories() {

    if (!categoryTabs) {
        return;
    }


    categoryTabs.innerHTML = "";


    const categories = [];


    products.forEach(function(product) {

        if (
            product.category &&
            !categories.includes(
                product.category
            )
        ) {

            categories.push(
                product.category
            );
        }

    });


    addCategory(
        "all",
        "All"
    );


    categories.forEach(
        function(category) {

            addCategory(
                category,
                category
            );

        }
    );
}


/* =========================================================
   ADD CATEGORY BUTTON
   ========================================================= */

function addCategory(
    value,
    text
) {

    if (!categoryTabs) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.type = "button";

    button.className =
        "category-btn";


    button.textContent =
        text;


    if (value === "all") {

        button.classList.add(
            "active"
        );
    }


    button.addEventListener(
        "click",
        function() {

            const buttons =
                categoryTabs.querySelectorAll(
                    ".category-btn"
                );


            buttons.forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            button.classList.add(
                "active"
            );


            applyFilters(value);

        }
    );


    categoryTabs.appendChild(
        button
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function searchProducts() {

    applyFilters();
}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );
}


/* =========================================================
   FILTER PRODUCTS
   ========================================================= */

function applyFilters(
    selectedCategory
) {

    let result =
        [...products];


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    /* Search */

    if (searchText !== "") {

        result =
            result.filter(
                function(product) {

                    const title =
                        String(
                            product.title || ""
                        ).toLowerCase();


                    const category =
                        String(
                            product.category || ""
                        ).toLowerCase();


                    return (
                        title.includes(
                            searchText
                        ) ||
                        category.includes(
                            searchText
                        )
                    );

                }
            );
    }


    /* Category */

    if (
        selectedCategory &&
        selectedCategory !== "all"
    ) {

        result =
            result.filter(
                function(product) {

                    return (
                        product.category ===
                        selectedCategory
                    );

                }
            );
    }


    /* Sorting */

    result =
        sortProducts(result);


    displayProducts(result);
}


/* =========================================================
   SORT PRODUCTS
   ========================================================= */

function sortProducts(list) {

    const result =
        [...list];


    if (!sortSelect) {

        return result;
    }


    const sortValue =
        sortSelect.value;


    /* Price low */

    if (
        sortValue ===
        "price-low"
    ) {

        result.sort(
            function(a, b) {

                return (
                    Number(a.price) -
                    Number(b.price)
                );

            }
        );
    }


    /* Price high */

    if (
        sortValue ===
        "price-high"
    ) {

        result.sort(
            function(a, b) {

                return (
                    Number(b.price) -
                    Number(a.price)
                );

            }
        );
    }


    /* Rating */

    if (
        sortValue ===
        "rating-high"
    ) {

        result.sort(
            function(a, b) {

                const ratingA =
                    getRating(a);


                const ratingB =
                    getRating(b);


                return (
                    ratingB -
                    ratingA
                );

            }
        );
    }


    /* Name A-Z */

    if (
        sortValue ===
        "name-a"
    ) {

        result.sort(
            function(a, b) {

                return String(
                    a.title
                ).localeCompare(
                    String(b.title)
                );

            }
        );
    }


    /* Name Z-A */

    if (
        sortValue ===
        "name-z"
    ) {

        result.sort(
            function(a, b) {

                return String(
                    b.title
                ).localeCompare(
                    String(a.title)
                );

            }
        );
    }


    return result;
}


function getRating(product) {

    if (
        product.rating &&
        typeof product.rating.rate ===
        "number"
    ) {

        return product.rating.rate;
    }

    return 0;
}


/* =========================================================
   SORT EVENT
   ========================================================= */

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        function() {

            applyFilters();

        }
    );
}


/* =========================================================
   ADD TO CART
   ========================================================= */

function addToCart(product) {

    const existingItem =
        cart.find(
            function(item) {

                return (
                    item.id ===
                    product.id
                );

            }
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            title:
                product.title,

            price:
                Number(
                    product.price
                ) || 0,

            image:
                product.image,

            quantity: 1

        });
    }


    saveCart();

    updateCart();

    showCartMessage();
}


/* =========================================================
   UPDATE CART COUNT
   ========================================================= */

function updateCart() {

    let totalItems = 0;


    cart.forEach(
        function(item) {

            totalItems +=
                Number(
                    item.quantity
                ) || 0;

        }
    );


    if (cartCount) {

        cartCount.textContent =
            String(totalItems);
    }
}


/* =========================================================
   CART SUCCESS MESSAGE
   ========================================================= */

function showCartMessage() {

    const oldMessage =
        document.querySelector(
            ".cart-message"
        );


    if (oldMessage) {

        oldMessage.remove();
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "cart-message";


    message.textContent =
        "✓ Added to cart";


    document.body.appendChild(
        message
    );


    setTimeout(
        function() {

            if (message) {

                message.remove();
            }

        },
        1500
    );
}


/* =========================================================
   DARK / LIGHT THEME
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "theme"
        );


    if (
        savedTheme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark"
        );


        if (themeToggle) {

            themeToggle.textContent =
                "☀️";
        }

    } else {

        document.body.classList.remove(
            "dark"
        );


        if (themeToggle) {

            themeToggle.textContent =
                "🌙";
        }
    }
}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const darkMode =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "theme",
        darkMode
            ? "dark"
            : "light"
    );


    if (themeToggle) {

        themeToggle.textContent =
            darkMode
                ? "☀️"
                : "🌙";
    }
}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        toggleTheme
    );
}


/* =========================================================
   HTML ESCAPE
   Prevents API text from being interpreted as HTML.
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   START APPLICATION
   ========================================================= */

loadCart();

loadTheme();

loadProducts();