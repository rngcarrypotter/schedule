document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('td[data-day]');
    const modal = document.getElementById('modal');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('appointmentForm');
    const deleteButton = document.getElementById('deleteButton');
    const markDoneButton = document.getElementById('markDoneButton');
    const markUndoneButton = document.getElementById('markUndoneButton');
    let selectedCell;
    let selectedAppointment;

    const GITHUB_REPO = 'rngcarrypotter/schedule';
    const GITHUB_TOKEN = 'GH_TOKEN';

    // Load appointments from GitHub
    loadAppointments();

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            selectedCell = cell;
            document.getElementById('appointmentDay').value = cell.dataset.day;
            document.getElementById('appointmentRow').value = cell.dataset.time;
            modal.style.display = 'block';
        });
    });

    span.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const minutes = document.getElementById('appointmentMinutes').value.padStart(2, '0');
        const description = document.getElementById('appointmentDescription').value;
        const hour = selectedCell.dataset.time.split(':')[0];
        if (selectedAppointment) {
            selectedAppointment.querySelector('.appointment-text').textContent = `${hour}:${minutes} - ${description}`;
        } else {
            const appointment = createAppointmentElement(`${hour}:${minutes}`, description);
            selectedCell.appendChild(appointment);
        }
        saveAppointments();
        modal.style.display = 'none';
        form.reset();
        updateCounters();
    });

    deleteButton.addEventListener('click', () => {
        if (selectedAppointment) {
            selectedAppointment.remove();
            selectedAppointment = null;
            saveAppointments();
            modal.style.display = 'none';
            form.reset();
            updateCounters();
        }
    });

    markDoneButton.addEventListener('click', () => {
        if (selectedAppointment) {
            selectedAppointment.style.backgroundColor = 'lightgreen';
            saveAppointments();
            updateCounters();
        }
    });

    markUndoneButton.addEventListener('click', () => {
        if (selectedAppointment) {
            selectedAppointment.style.backgroundColor = 'lightcoral';
            saveAppointments();
            updateCounters();
        }
    });

    function createAppointmentElement(time, description) {
        const appointment = document.createElement('div');
        appointment.className = 'appointment';
        appointment.innerHTML = `<span class="appointment-text">${time} - ${description}</span>`;
        appointment.addEventListener('click', () => {
            selectedAppointment = appointment;
            const [hour, minutes] = time.split(':');
            document.getElementById('appointmentMinutes').value = minutes;
            document.getElementById('appointmentDescription').value = description;
            modal.style.display = 'block';
        });
        return appointment;
    }

    async function saveAppointments() {
        const timetableData = [];
        cells.forEach(cell => {
            const appointments = Array.from(cell.children).map(app => ({
                time: app.querySelector('.appointment-text').textContent.split(' - ')[0],
                description: app.querySelector('.appointment-text').textContent.split(' - ')[1],
                status: app.style.backgroundColor // Save the status (color) of the appointment
            }));
            timetableData.push({
                day: cell.dataset.day,
                time: cell.dataset.time,
                appointments: appointments
            });
        });
        const jsonData = JSON.stringify(timetableData);

        const sha = await getCurrentFileSha('timetable.json');
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/timetable.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update timetable data',
                content: btoa(unescape(encodeURIComponent(jsonData))),
                sha: sha || null
            })
        });

        if (!response.ok) {
            console.error('Failed to save timetable:', response.statusText);
        }
    }

    async function getCurrentFileSha(filename) {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.sha;
        } else if (response.status === 404) {
            return null;
        }
        return null;
    }

    async function loadAppointments() {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/timetable.json`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            const timetableData = JSON.parse(decodeURIComponent(escape(atob(data.content))));
            timetableData.forEach(entry => {
                const cell = document.querySelector(`td[data-day="${entry.day}"][data-time="${entry.time}"]`);
                if (cell) {
                    entry.appointments.forEach(app => {
                        const appointment = createAppointmentElement(app.time, app.description);
                        appointment.style.backgroundColor = app.status; // Load the status (color) of the appointment
                        cell.appendChild(appointment);
                    });
                }
            });
            updateCounters();
        }
    }

    function updateCounters() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            const done = document.querySelectorAll(`td[data-day="${day}"] .appointment[style*="lightgreen"]`).length;
            const undone = document.querySelectorAll(`td[data-day="${day}"] .appointment[style*="lightcoral"]`).length;
            document.getElementById(`${day}-count`).textContent = `${done} Done / ${undone} Undone`;
        });
    }

    // Menu plan
    const menuCells = document.querySelectorAll('#menuPlan td[contenteditable="true"]');
    menuCells.forEach(cell => {
        cell.addEventListener('input', saveMenuPlan);
    });

    async function saveMenuPlan() {
        const menuPlanData = [];
        menuCells.forEach(cell => {
            menuPlanData.push({
                day: cell.parentElement.firstElementChild.textContent,
                meal: cell.cellIndex === 1 ? 'lunch' : 'dinner',
                content: cell.textContent
            });
        });
        const jsonData = JSON.stringify(menuPlanData);

        const sha = await getCurrentFileSha('menuPlan.json');
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/menuPlan.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update menu plan data',
                content: btoa(unescape(encodeURIComponent(jsonData))),
                sha: sha || null
            })
        });

        if (!response.ok) {
            console.error('Failed to save menu plan:', response.statusText);
        }
    }

    async function loadMenuPlan() {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/menuPlan.json`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            cons
