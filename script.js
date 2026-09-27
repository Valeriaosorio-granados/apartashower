// Lista inicial completa de regalos (con los nuevos agregados)
const initialGifts = [
    "Sartén", 
    "Juego de cubiertos", 
    "Bowl", 
    "Vasos", 
    "Pocillos",
    "Sandwichera", 
    "Platos", 
    "Canasto para ropa", 
    "Kit de limpieza",
    "Juego de sábanas", 
    "Kit de toallas de baño", 
    "Recipientes herméticos",
    "Salero y pimentero", 
    "Organizador para baño/cocina",
    "Cuchillos de cocina",
    "Utensilios de cocina (espátula, cucharón, pinzas)",
    "Tabla para picar",
    "Colador",
    "Recipientes para guardar comida",
    "Escurridor de platos",
    "Espejo",
    "Dispensadores para jabón"
];

// Cargar regalos desde el navegador
let giftsData = JSON.parse(localStorage.getItem('regalosValu'));

// Si no existen, o si la cantidad de regalos es diferente a la lista inicial (para agregar los nuevos)
if (!giftsData || Object.keys(giftsData).length !== initialGifts.length) {
    giftsData = {};
    initialGifts.forEach((gift, index) => {
        giftsData['item_' + index] = { name: gift, taken: false };
    });
    localStorage.setItem('regalosValu', JSON.stringify(giftsData));
}

// Función para mostrar la lista en pantalla
function renderList() {
    const listElement = document.getElementById('gift-list');
    listElement.innerHTML = ''; // Limpiar lista
    
    for (const key in giftsData) {
        const item = giftsData[key];
        
        const li = document.createElement('li');
        li.className = 'gift-item';
        if (item.taken) li.classList.add('taken');
        
        const span = document.createElement('span');
        span.className = 'gift-name';
        span.textContent = item.name;
        
        const button = document.createElement('button');
        button.className = 'btn-select';
        
        if (item.taken) {
            button.textContent = 'Ya lo llevan';
            button.disabled = true;
        } else {
            button.textContent = '¡Yo lo llevo!';
            button.onclick = () => {
                if(confirm(`¿Confirmas que llevarás: ${item.name}?`)) {
                    takeGift(key);
                }
            };
        }
        
        li.appendChild(span);
        li.appendChild(button);
        listElement.appendChild(li);
    }
}

// Función para tachar el regalo
function takeGift(key) {
    giftsData[key].taken = true;
    localStorage.setItem('regalosValu', JSON.stringify(giftsData));
    renderList(); // Recargar la vista
}

// Iniciar la página
renderList();