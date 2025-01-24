document.addEventListener("DOMContentLoaded", function() {
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
                window.location.href = response.url; 
            } else {
                alert('Failed to add task.');
            }
        })
        .catch(error => console.error("Error:", error));
    });

    window.deleteTask = function(index) {
        if (confirm("Are you sure you want to delete this task?")) {
            fetch(`/delete/${index}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();  
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
