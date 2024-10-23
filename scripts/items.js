document.addEventListener('DOMContentLoaded', () => {
    loadItems(); // Cargar los items al inicio

    // Botón para abrir el modal y agregar un nuevo item
    document.getElementById('addItemButton').addEventListener('click', () => {
        openModal('Agregar Item');
    });

    // Evento submit del formulario del modal
    document.getElementById('itemForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('itemId').value;
        const nombre = document.getElementById('itemNombre').value;
        const descripcion = document.getElementById('itemDescripcion').value;

        if (id) {
            await updateItem(id, nombre, descripcion);
        } else {
            await addItem(nombre, descripcion);
        }

        closeModal();
        loadItems(); // Recargar la lista de items
    });

    // Evento delegado para los botones de "Editar" y "Eliminar" en la tabla
    document.getElementById('itemsTable').addEventListener('click', async (event) => {
        const target = event.target;
        
        // Comprobar si es un botón y tiene el atributo 'data-item-id'
        if (target.tagName === 'BUTTON' && target.hasAttribute('data-item-id')) {
            const itemId = target.getAttribute('data-item-id');
            
            // Identificar si es un botón de "Editar" o "Eliminar"
            if (target.textContent.trim() === 'Editar') {
                openModal('Editar Item', itemId);
            } else if (target.textContent.trim() === 'Eliminar') {
                await deleteItem(itemId);
                loadItems(); // Recargar los items tras eliminar
            }
        }
    });
});

// Función para cargar items desde el servidor
async function loadItems() {
    const response = await fetch('/items');
    const items = await response.json();

    const tableBody = document.getElementById('itemsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpiar el contenido anterior

    items.forEach((item) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${item.ItemID}</td>
            <td>${item.Nombre}</td>
            <td>${item.Descripcion}</td>
            <td>
                <button data-item-id="${item.ItemID}">Editar</button>
                <button data-item-id="${item.ItemID}">Eliminar</button>
            </td>
        `;
    });
}

// Función para agregar un nuevo item
async function addItem(nombre, descripcion) {
    const response = await fetch('/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
    });

    if (!response.ok) {
        throw new Error(`Error al agregar item: ${response.statusText}`);
    }
}

// Función para actualizar un item existente
async function updateItem(id, nombre, descripcion) {
    const response = await fetch(`/items/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
    });

    if (!response.ok) {
        throw new Error(`Error al actualizar item: ${response.statusText}`);
    }
}

// Función para eliminar un item
async function deleteItem(id) {
    const response = await fetch(`/items/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Error al eliminar item: ${response.statusText}`);
    }
}

// Función para abrir el modal de agregar o editar un item
function openModal(title, itemId = null) {
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    const itemIdInput = document.getElementById('itemId');
    const itemNombreInput = document.getElementById('itemNombre');
    const itemDescripcionInput = document.getElementById('itemDescripcion');

    modal.classList.remove('hidden'); // Mostrar el modal
    modalTitle.textContent = title;

    if (itemId) {
        // Editar item existente
        itemIdInput.value = itemId;
        itemNombreInput.value = '';
        itemDescripcionInput.value = '';

        fetch(`/items/${itemId}`)
            .then((response) => response.json())
            .then((item) => {
                itemNombreInput.value = item.Nombre;
                itemDescripcionInput.value = item.Descripcion;
            });
    } else {
        // Agregar nuevo item
        itemIdInput.value = '';
        itemNombreInput.value = '';
        itemDescripcionInput.value = '';
    }
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById('itemModal').classList.add('hidden');
}
