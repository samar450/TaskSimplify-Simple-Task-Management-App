from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(24))

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///tasks.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = "info"

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(512), nullable=False)  

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(255), nullable=False)
    due_date = db.Column(db.String(100), nullable=True)
    due_time = db.Column(db.String(100), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    priority = db.Column(db.String(100), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('tasks', lazy=True))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
@login_required
def index():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    return render_template('tasks.html', tasks=tasks)

@app.route('/add', methods=['POST'])
@login_required
def add_task():
    task = request.form.get('task', '')[:30]
    due_date = request.form.get('due_date') or 'N/A'
    due_time = request.form.get('due_time') or 'N/A'
    description = request.form.get('description', '')[:100]
    priority = request.form.get('priority')

    new_task = Task(task=task, due_date=due_date, due_time=due_time, description=description,
                    priority=priority, completed=False, user_id=current_user.id)

    db.session.add(new_task)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/delete/<int:task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id == current_user.id:
        db.session.delete(task)
        db.session.commit()
    return jsonify({'success': True})

@app.route('/mark_done/<int:task_id>', methods=['POST'])
@login_required
def mark_done(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id == current_user.id:
        task.completed = not task.completed
        db.session.commit()
    return jsonify({'success': True, 'completed': task.completed})

@app.route('/clear', methods=['POST'])
@login_required
def clear_tasks():
    try:
        Task.query.filter_by(user_id=current_user.id).delete()
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()

        if " " in username or " " in password:
            flash('Spaces are not allowed in username or password.', 'danger')
            return render_template('login.html')

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user, remember=True)
            session.permanent = True
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password', 'danger')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    flash('Logged out successfully!', 'info')
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()

        if " " in username or " " in password:
            flash('Spaces are not allowed in username or password.', 'danger')
            return render_template('register.html')

        if not User.query.filter_by(username=username).first():
            password_hash = generate_password_hash(password)
            new_user = User(username=username, password=password_hash)
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Username already taken', 'danger')

    return render_template('register.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True)
