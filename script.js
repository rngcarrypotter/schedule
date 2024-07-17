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
        const time = document.getElementById('appointmentTime').value;
        const description = document.getElementById('appointmentDescription').value;
        const appointment = createAppointmentElement(time, description);
        selectedCell.appendChild(appointment);
        saveAppointments();
        modal.style.display = 'none';
        form.reset();
    });

    function createAppointmentElement(time, description) {
        const appointment = document.createElement('div');
        appointment.className = 'appointment';
        appointment.innerHTML = `${time} - ${description} <span class="edit">✏️</span> <span class="delete">🗑️</span>`;
        appointment.querySelector('.edit').addEventListener('click', () => editAppointment(appointment));
        appointment.querySelector('.delete').addEventListener('click', () => deleteAppointment(appointment));
        return appointment;
    }

    function editAppointment(appointment) {
        const time = prompt("Edit Time:", appointment.textContent.split(' - ')[0]);
        const description = prompt("Edit Description:", appointment.textContent.split(' - ')[1].split(' ')[0]);
        if (time && description) {
            appointment.innerHTML = `${time} - ${description} <span class="edit">✏️</span> <span class="delete">🗑️</span>`;
            appointment.querySelector('.edit').addEventListener('click', () => editAppointment(appointment));
            appointment.querySelector('.delete').addEventListener('click', () => deleteAppointment(appointment));
            saveAppointments();
        }
    }

    function deleteAppointment(appointment) {
        if (confirm("Are you sure you want to delete this appointment?")) {
            appointment.remove();
            saveAppointments();
        }
    }

    function saveAppointments() {
        const timetableData = [];
        cells.forEach(cell => {
            const appointments = Array.from(cell.children).map(app => ({
                time: app.textContent.split(' - ')[0],
                description: app.textContent.split(' - ')[1].split(' ')[0],
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
            const cell = document.querySelector(`#menuPlan td:nth-child(${entry.meal === 'lunch' ? 2 : 3})[contenteditable="true"]`);
            if (cell) {
                cell.textContent = entry.content;
            }
        });
    }

    loadMenuPlan();
});
