const mainUrl = 'https://api.training.theburo.nl';
const listBooks = document.querySelector('#books');
const listAuthors = document.querySelector('#authors');
const listGenres = document.querySelector('#genres');
var modal = document.getElementById("formModal");
var span = document.getElementsByClassName("close")[0];

const dataArrays = {
    books: [],
    authors: [],
    genres: [],
};

async function createHTML(columnSelector, subject) {
    let data;

    if (dataArrays[subject].length === 0) {
        data = await fetchData(subject);
        dataArrays[subject] = data;
    }

    data = dataArrays[subject];

    columnSelector.innerHTML = '';

    data.forEach(item => {
        const html = `
            <li>
                <span>${item.name}</span>
                <button onclick="updateItem('${subject}', ${item.id})">Update</button>
                <button onclick="deleteRequest('${subject}', ${item.id})">Delete</button>
            </li>
        `;

        columnSelector.insertAdjacentHTML('beforeend', html);
    });

    const addBtn = document.createElement('button');
    addBtn.textContent = `Add ${subject.slice(0, -1)}`;
    addBtn.onclick = function () {
        addItemButton(subject);
    };

    columnSelector.insertAdjacentElement('beforeend', addBtn);
}

/** CRUD Functions **/

function addItemButton(subject) {
    const modalContent = createModalFields(subject);
    let requestBody;

    const createButton = document.createElement("button");
    createButton.textContent = "Add";
    createButton.onclick = function () {

        requestBody = createRequestBody(subject, modalContent);

        addRequest(subject, requestBody);
    };

    modalContent.appendChild(createButton);
    modal.style.display = "block";
}

function addRequest(subject, requestBody) {
    const url = `${mainUrl}/${subject}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            dataArrays[subject].push({ id: requestBody.id, ...requestBody });

            createHTML(getColumnSelector(subject), subject);

            modal.style.display = "none";
        })
        .catch(error => {
            console.error('There was a problem adding the item:', error);
        });
}


async function fetchData(subject) {
    const response = await fetch(`${mainUrl}/${subject}`);
    const body = await response.json();
    dataArrays[subject] = body.data;

    return dataArrays[subject];
}

function updateItem(subject, itemId) {
    const modalContent = createModalFields(subject);

    let requestBody;

    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.onclick = function () {

        requestBody = createRequestBody(subject, modalContent);
        updateRequest(subject, itemId, requestBody);
    };

    modalContent.appendChild(updateButton);

    modal.style.display = "block";
}

function updateRequest(subject, itemId, requestBody) {
    const url = `${mainUrl}/${subject}/${itemId}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const index = findIndex(subject, itemId);
            if (index !== -1) {
                dataArrays[subject][index] = { id: itemId, ...requestBody };
            }

            createHTML(getColumnSelector(subject), subject);

            modal.style.display = "none";
        })
        .catch(error => {
            console.error('There was a problem updating the item:', error);
        });
}

async function deleteRequest(subject, itemId) {
    const url = `${mainUrl}/${subject}/${itemId}`;

    fetch(url, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const index = findIndex(subject, itemId);
            if (index !== -1) {
                dataArrays[subject].splice(index, 1);
            }

            createHTML(getColumnSelector(subject), subject);
        })
        .catch(error => {
            console.error('There was a problem deleting the item:', error);
        });
}

/* End CRUD Functions */

function createModalFields(subject) {
    const modalContent = document.querySelector(".modal-content");
    modalContent.innerHTML = "";

    const inputFields = {
        books: ["name", "author_id", "genre_ids"],
        authors: ["name", "age"],
        genres: ["name"],
    };

    inputFields[subject].forEach(field => {
        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", field);

        if (subject === "books" && (field === "author_id" || field === "genre_ids")) {
            const dropdown = document.createElement("select");
            dropdown.setAttribute("placeholder", field);

            const dataArray = field === "author_id" ? dataArrays.authors : dataArrays.genres;

            dataArray.forEach(item => {
                const option = document.createElement("option");
                option.setAttribute('class', `${subject} ${item.id}`);

                option.value = item.id;
                option.textContent = item.name;

                dropdown.appendChild(option);
            });

            modalContent.appendChild(dropdown);
        } else {

            modalContent.appendChild(input);
        }
    });

    return modalContent;
}

function createRequestBody(subject, modalContent) {
    switch (subject) {
        case "books": {
            const authorDropdown = modalContent.querySelector('select[placeholder="author_id"]');
            const genreDropdown = modalContent.querySelector('select[placeholder="genre_ids"]');

            requestBody = {
                name: modalContent.querySelector('input[placeholder="name"]').value,
                author_id: parseInt(authorDropdown.value),
                genre_ids: Array.from(genreDropdown.selectedOptions).map(option => parseInt(option.value)),
            };
            break;
        }
        case "authors": {
            requestBody = {
                name: modalContent.querySelector('input[placeholder="name"]').value,
                age: modalContent.querySelector('input[placeholder="age"]').value
            };
            break;
        }
        case "genres": {
            requestBody = {
                name: modalContent.querySelector('input[placeholder="name"]').value
            };
            break;
        }
    }
    return requestBody;
}

function getColumnSelector(subject) {
    switch (subject) {
        case "books":
            return listBooks;
        case "authors":
            return listAuthors;
        case "genres":
            return listGenres;
        default:
            return null;
    }
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function findIndex(subject, itemId) {
    const index = dataArrays[subject].findIndex(item => item.id === itemId);
    return index;
}

createHTML(listBooks, "books");
createHTML(listAuthors, "authors");
createHTML(listGenres, "genres");