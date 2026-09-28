// Configuración de Supabase con los datos que me diste
const supabaseUrl = 'https://xhgokchrgroofkgyqsxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ29rY2hyZ3Jvb2ZrZ3lxc3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODIxMDksImV4cCI6MjEwNjE1ODEwOX0.U-KoKqNlhr5I18XOkyo-R0ng4lDWtBYzmd4x5u0lmhI';

// ¡CAMBIO CLAVE AQUÍ! Le cambiamos el nombre a 'supabaseClient' para que no pelee con la librería
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let giftsData = [];

// Función para cargar los regalos desde Supabase
async function fetchGifts() {
    try {
        // Usamos supabaseClient en lugar de supabase
        const { data, error } = await supabaseClient
            .from('regalos')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        if (data && data.length > 0) {
            giftsData = data;
            renderList();
        } else {
            document.getElementById('gift-list').innerHTML = '<p style="text-align:center; color:#888;">La lista de regalos está vacía en Supabase.</p>';
        }

    } catch (err) {
        console.error('Error cargando datos:', err.message);
        document.getElementById('gift-list').innerHTML = `
            <div style="background:#ffcccc; padding:15px; border-radius:10px; text-align:center; color:#cc0000;">
                <p><strong>Error de conexión:</strong></p>
                <p>${err.message}</p>
                <p style="font-size:0.8rem; margin-top:10px;">Verifica que el RLS esté desactivado en Supabase.</p>
            </div>
        `;
    }
}

// Renderizar la lista en el HTML
function renderList() {
    const listElement = document.getElementById('gift-list');
    listElement.innerHTML = ''; // Limpiamos el mensaje de carga
    
    giftsData.forEach(item => {
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
                if(confirm(`¿Confirmas que vas a llevar: ${item.name}?`)) {
                    takeGift(item.id, button);
                }
            };
        }
        
        li.appendChild(span);
        li.appendChild(button);
        listElement.appendChild(li);
    });
}

// Tachar el regalo en la base de datos
async function takeGift(id, btnElement) {
    btnElement.textContent = 'Guardando...';
    btnElement.disabled = true;

    try {
        // Usamos supabaseClient aquí también
        const { error } = await supabaseClient
            .from('regalos')
            .update({ taken: true })
            .eq('id', id);
        
        if (error) throw error;
        
    } catch (err) {
        console.error('Error al actualizar:', err.message);
        alert('Hubo un error al tachar el regalo. Intenta de nuevo.');
        btnElement.textContent = '¡Yo lo llevo!';
        btnElement.disabled = false;
    }
}

// Suscribirse a los cambios en Tiempo Real para que se actualice a todos
supabaseClient
    .channel('public:regalos')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'regalos' }, payload => {
        const updatedGift = payload.new;
        const index = giftsData.findIndex(g => g.id === updatedGift.id);
        
        if (index !== -1) {
            giftsData[index] = updatedGift;
            renderList();
        }
    })
    .subscribe();

// Iniciar la carga de datos al abrir la página
fetchGifts();