from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
from datetime import datetime

app = Flask(__name__)
TASK_FILE = "tasks.json"

def load_tasks():
    try:
        with open(TASK_FILE, "r") as file:
            tasks = json.load(file)
            for task in tasks:
                if not task.get('due_date') or task['due_date'] == 'N/A':
                    task['due_date'] = None
            sorted_tasks = sorted(
                tasks,
                key=lambda x: (x['due_date'] is None, x['due_date'] or '', x['due_time'] or '')
            )
            return sorted_tasks
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_tasks(tasks):
    with open(TASK_FILE, "w") as file:
        json.dump(tasks, file, indent=4)

@app.route('/')
def index():
    tasks = load_tasks()
    return render_template('tasks.html', tasks=tasks)

@app.route('/tasks')
def tasks_page():
    tasks = load_tasks()
    return render_template('tasks.html', tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    task = request.form.get('task', '')[:30]
    due_date = request.form.get('due_date') or 'N/A'
    due_time = request.form.get('due_time') or 'N/A'
    description = request.form.get('description', '')[:100]
    priority = request.form.get('priority')

    if task:
        tasks = load_tasks()
        tasks.append({
            "task": task,
            "due_date": due_date,
            "due_time": due_time,
            "description": description,
            "priority": priority,
            "completed": False
        })
        save_tasks(tasks)
    return redirect(url_for('tasks_page'))

@app.route('/delete/<int:task_index>', methods=['POST'])
def delete_task(task_index):
    tasks = load_tasks()
    if 0 <= task_index < len(tasks):
        del tasks[task_index]
        save_tasks(tasks)
    return jsonify({'success': True})

@app.route('/mark_done/<int:task_index>', methods=['POST'])
def mark_done(task_index):
    tasks = load_tasks()
    if 0 <= task_index < len(tasks):
        tasks[task_index]['completed'] = not tasks[task_index].get('completed', False)
        save_tasks(tasks)
    return jsonify({'success': True})

@app.route('/clear', methods=['POST'])
def clear_tasks():
    save_tasks([])  # Clear tasks.json
    return jsonify({'success': True})

@app.route('/sort')
def sort_tasks():
    tasks = load_tasks()
    
    if not tasks:
        return jsonify({'success': False, 'message': 'No tasks to sort.'})

    tasks.sort(key=lambda x: (x['due_date'] == 'N/A', x['due_date'] or '', x['due_time'] or ''))
    
    save_tasks(tasks)
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
