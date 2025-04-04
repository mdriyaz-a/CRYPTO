from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import subprocess
import eventlet

eventlet.monkey_patch()  # Needed for eventlet compatibility

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('run_command')
def handle_command(data):
    command = data['command']
    try:
        output = subprocess.check_output(command, shell=True, text=True, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        output = e.output
    emit('command_output', {'output': output})

if __name__ == '__main__':
    socketio.run(app, debug=True)
