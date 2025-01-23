document.addEventListener("DOMContentLoaded", function() {
    // Toggle task completion
    window.toggleDone = function(button) {
        let row = button.closest('tr');
        row.classList.toggle('completed-task');
        button.textContent = row.classList.contains('completed-task') ? 'Undo' : 'Done';
    };

    // Delete task with confirmation
    window.deleteTask = function(element) {
        if (!confirm("Are you sure you want to delete this task?")) return;
        let row = element.closest('tr');
        row.remove();
    };

    // Clear all tasks
    window.clearTasks = function() {
        if (!confirm("Are you sure you want to clear all tasks?")) return;
        document.getElementById('task-list').innerHTML = '';
    };

    // Sort tasks by due date
    window.sortTasks = function() {
        let taskList = document.querySelector('#task-list');
        let tasks = Array.from(taskList.querySelectorAll('tr'));

        tasks.sort((a, b) => {
            let dateA = a.children[1].textContent.trim() || 'N/A';
            let dateB = b.children[1].textContent.trim() || 'N/A';

            if (dateA === 'N/A') return 1;
            if (dateB === 'N/A') return -1;
            
            return new Date(dateA) - new Date(dateB);
        });

        tasks.forEach(task => taskList.appendChild(task));
    };

    // Priority Button toggle logic
    document.getElementById("priority-btn").addEventListener("click", function() {
        let priorityInput = document.getElementById("priority-input");

        if (priorityInput.value === "high") {
            priorityInput.value = "normal";
            this.textContent = "High Priority";
            this.classList.remove("active");
        } else {
            priorityInput.value = "high";
            this.textContent = "Priority Set";
            this.classList.add("active");
        }
    });

    // Add task function
    document.querySelector(".add-task").addEventListener("click", function(event) {
        event.preventDefault();

        let taskName = document.querySelector('input[name="task"]').value.trim();
        let dueDate = document.querySelector('input[name="due_date"]').value || 'N/A';
        let dueTime = document.querySelector('input[name="due_time"]').value || 'N/A';
        let description = document.querySelector('textarea[name="description"]').value.trim();
        let priority = document.getElementById("priority-input").value;

        if (!taskName) {
            alert("Please enter a task name.");
            return;
        }

        let newRow = document.createElement("tr");
        if (priority === "high") {
            newRow.classList.add("high-priority");
        }

        newRow.innerHTML = `
            <td>${taskName}</td>
            <td>${dueDate}</td>
            <td>${dueTime}</td>
            <td>${description}</td>
            <td class="task-actions-column">
                <button class="btn delete-btn" onclick="deleteTask(this)">Delete</button>
                <button class="btn done-btn" onclick="toggleDone(this)">Done</button>
            </td>
        `;

        document.getElementById('task-list').appendChild(newRow);

        // Reset form fields
        document.querySelector('input[name="task"]').value = "";
        document.querySelector('input[name="due_date"]').value = "";
        document.querySelector('input[name="due_time"]').value = "";
        document.querySelector('textarea[name="description"]').value = "";

        // Reset priority button
        document.getElementById("priority-btn").textContent = "High Priority";
        document.getElementById("priority-btn").classList.remove("active");
        document.getElementById("priority-input").value = "normal";
    });
});
