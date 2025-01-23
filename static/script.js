document.addEventListener("DOMContentLoaded", function() {
    // Priority Button Toggle
    document.getElementById("priority-btn").addEventListener("click", function() {
        this.classList.toggle("active");
        document.getElementById("priority-input").value = this.classList.contains("active") ? "high" : "normal";
    });

    document.getElementById("task-form").addEventListener("submit", function(event) {
        event.preventDefault();

        let formData = new FormData(this);

        fetch('/add', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url; // Reload to fetch updated tasks
            } else {
                alert('Failed to add task.');
            }
        })
        .catch(error => console.error("Error:", error));
    });

    //Delete Task from Frontend and Backend
    window.deleteTask = function(index) {
        if (confirm("Are you sure you want to delete this task?")) {
            fetch(`/delete/${index}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();  // Reload to reflect changes
                } else {
                    alert("Failed to delete task.");
                }
            })
            .catch(error => console.error("Error:", error));
        }
    };

    window.toggleDone = function(index) {
        fetch(`/mark_done/${index}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();  
            } else {
                alert("Failed to update task status.");
            }
        })
        .catch(error => console.error("Error:", error));
    };

    // Clear All Tasks with the Backend Sync
    window.clearTasks = function() {
        fetch('/clear', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert("Failed to clear tasks.");
            }
        })
        .catch(error => console.error("Error:", error));
    };

    // Sort Tasks with Backend Sync
    window.sortTasks = function() {
        fetch('/sort', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Failed to sort tasks: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    };

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});
