document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('td[data-day]');
    const modal = document.getElementById('modal');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('appointmentForm');
    let selectedCell;

    // Load appointments from localStorage
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
        const appointment = createAppointmentElement(`${hour}:${minutes}`, description);
        selectedCell.appendChild(appointment);
        saveAppointments();
        modal.style.display = 'none';
        form.reset();
    });

    function createAppointmentElement(time, description) {
        const appointment = document.createElement('div');
        appointment.className = 'appointment';
        appointment.innerHTML = `<span class="appointment-text">${time} - ${description}</span>
                                 <span class="appointment-icons">
                                     <span class="edit">✏️</span>
                                     <span class="delete">🗑️</span>
                                     <span class="mark-done">✔️</span>
                                     <span class="mark-undone">❌</span>
                                 </span>`;
        appointment.querySelector('.edit').addEventListener('click', (e) => { e.stopPropagation(); editAppointment(appointment); });
        appointment.querySelector('.delete').addEventListener('click', (e) => { e.stopPropagation(); deleteAppointment(appointment); });
        appointment.querySelector('.mark-done').addEventListener('click', (e) => { e.stopPropagation(); markDone(appointment); });
        appointment.querySelector('.mark-undone').addEventListener('click', (e) => { e.stopPropagation(); markUndone(appointment); });
        appointment.addEventListener('click', () => toggleIcons(appointment));
        return appointment;
    }

    function toggleIcons(appointment) {
        const icons = appointment.querySelector('.appointment-icons');
        icons.style.display = icons.style.display === 'block' ? 'none' : 'block';
    }

    function editAppointment(appointment) {
        const time = prompt("Edit Time (HH:MM):", appointment.querySelector('.appointment-text').textContent.split(' - ')[0]);
        const description = prompt("Edit Description:", appointment.querySelector('.appointment-text').textContent.split(' - ')[1]);
        if (time && description) {
            appointment.querySelector('.appointment-text').textContent = `${time} - ${description}`;
            saveAppointments();
        }
    }

    function deleteAppointment(appointment) {
        if (confirm("Are you sure you want to delete this appointment?")) {
            appointment.remove();
            saveAppointments();
        }
    }

    function markDone(appointment) {
        appointment.style.backgroundColor = 'lightgreen';
        saveAppointments();
    }

    function markUndone(appointment) {
        appointment.style.backgroundColor = 'lightcoral';
        saveAppointments();
    }

    function saveAppointments() {
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
        localStorage.setItem('timetable', JSON.stringify(timetableData));
    }

    function loadAppointments() {
        const timetableData = JSON.parse(localStorage.getItem('timetable')) || [];
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
    }

    // Menu plan
    const menuCells = document.querySelectorAll('#menuPlan td[contenteditable="true"]');
    menuCells.forEach(cell => {
        cell.addEventListener('input', saveMenuPlan);
    });

    function saveMenuPlan() {
        const menuPlanData = [];
        menuCells.forEach(cell => {
            menuPlanData.push({
                day: cell.parentElement.firstElementChild.textContent,
                meal: cell.cellIndex === 1 ? 'lunch' : 'dinner',
                content: cell.textContent
            });
        });
        localStorage.setItem('menuPlan', JSON.stringify(menuPlanData));
    }

    function loadMenuPlan() {
        const menuPlanData = JSON.parse(localStorage.getItem('menuPlan')) || [];
        menuPlanData.forEach(entry => {
            const dayRow = Array.from(document.querySelectorAll('#menuPlan td')).find(td => td.textContent === entry.day).parentElement;
            const cell = entry.meal === 'lunch' ? dayRow.children[1] : dayRow.children[2];
            cell.textContent = entry.content;
        });
    }

    loadMenuPlan();
});
