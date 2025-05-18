const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.section');
const dateSelect = document.getElementById('mealDate');
const calendarDays = document.getElementById('calendarDays');
const mealsDisplay = document.getElementById('mealsDisplay');
const uploadInput = document.getElementById('imageUpload');
const uploadLabel = document.getElementById('uploadLabel');
const mealTypeSelect = document.getElementById('mealType');
const titleSpan = document.querySelector('#titulo span');
const toastMsg = document.getElementById('toastMsg');
let uploadedImageData = '';

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === "calendario") renderCalendar();
  });
});

mealTypeSelect.addEventListener('change', () => {
  titleSpan.textContent = mealTypeSelect.value;
});

const today = new Date();
for (let i = 0; i <= 5; i++) {
  const date = new Date();
  date.setDate(today.getDate() - i);
  const option = document.createElement("option");
  option.value = date.toISOString().split('T')[0];
  option.textContent = i === 0 ? "Hoy" : date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  dateSelect.appendChild(option);
}

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    uploadedImageData = reader.result;
    uploadLabel.querySelector('span').textContent = "Imagen cargada ✅";
  };
  if (file) reader.readAsDataURL(file);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const date = dateSelect.value;
  const name = document.getElementById('mealName').value.trim();
  const type = mealTypeSelect.value;
  const calories = document.getElementById('mealCalories').value.trim();
  const origin = document.getElementById('extraInfo').value.trim();

  if (!name || name.length < 2 || !uploadedImageData) {
    alert("Por favor, sube una imagen y escribe un nombre válido.");
    return;
  }

  if (calories && (isNaN(calories) || Number(calories) < 0)) {
    alert("Calorías debe ser un número positivo.");
    return;
  }

  const stored = JSON.parse(localStorage.getItem('meals') || '{}');
  if (!stored[date]) stored[date] = [];
  stored[date].push({
    img: uploadedImageData,
    name,
    type,
    calories: calories || null,
    origin: origin || null
  });

  localStorage.setItem('meals', JSON.stringify(stored));
  showToast("Comida guardada ✅");

  uploadedImageData = '';
  uploadLabel.querySelector('span').textContent = "Click para subir";
  uploadInput.value = '';
  document.getElementById('mealName').value = '';
  document.getElementById('extraInfo').value = '';
  document.getElementById('mealCalories').value = '';
});

function showToast(message) {
  toastMsg.textContent = message;
  toastMsg.style.display = 'block';
  setTimeout(() => {
    toastMsg.style.display = 'none';
  }, 3000);
}

function renderCalendar() {
  calendarDays.innerHTML = '';
  mealsDisplay.innerHTML = '';
  const stored = JSON.parse(localStorage.getItem('meals') || '{}');

  Object.keys(stored).forEach(date => {
    if (stored[date].length === 0) return;
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    day.addEventListener('click', () => showMeals(date));
    calendarDays.appendChild(day);
  });
}

function showMeals(date) {
  mealsDisplay.innerHTML = '';
  const stored = JSON.parse(localStorage.getItem('meals') || '{}');
  if (!stored[date]) return;

  const grouped = {};
  stored[date].forEach(entry => {
    if (!grouped[entry.type]) grouped[entry.type] = [];
    grouped[entry.type].push(entry);
  });

  for (const type in grouped) {
    const typeTitle = document.createElement('div');
    typeTitle.className = 'meal-type';
    typeTitle.textContent = type;
    mealsDisplay.appendChild(typeTitle);

    grouped[type].forEach(entry => {
      const card = document.createElement('div');
      card.className = 'meal-card';

      if (entry.img) {
        const img = document.createElement('img');
        img.src = entry.img;
        card.appendChild(img);
      }

      const name = document.createElement('p');
      name.textContent = entry.name;
      card.appendChild(name);

      if (entry.calories) {
        const cal = document.createElement('p');
        cal.textContent = `🔥 ${entry.calories} kcal`;
        cal.style.fontWeight = '500';
        cal.style.color = '#d9534f';
        card.appendChild(cal);
      }

      if (entry.origin) {
        const origin = document.createElement('p');
        origin.textContent = `📍 ${entry.origin}`;
        origin.style.fontSize = '0.9rem';
        origin.style.color = '#555';
        card.appendChild(origin);
      }

      const deleteIcon = document.createElement('div');
      deleteIcon.className = 'delete-icon';
      deleteIcon.textContent = '×';
      deleteIcon.title = 'Eliminar';
      deleteIcon.addEventListener('click', () => {
        if (confirm('¿Eliminar esta comida?')) {
          stored[date].splice(stored[date].indexOf(entry), 1);
          if (stored[date].length === 0) delete stored[date];
          localStorage.setItem('meals', JSON.stringify(stored));
          showMeals(date);
          renderCalendar();
        }
      });
      card.appendChild(deleteIcon);

      mealsDisplay.appendChild(card);
    });
  }
}
