from flask import Flask, request, jsonify
import psycopg2
import uuid
from datetime import date
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# Kết nối PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="postgres",   
    user="postgres",             
    password="01010102",     
    port="5432"
)
cursor = conn.cursor()

# Đăng ký
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # Kiểm tra username hoặc email đã tồn tại chưa
    cursor.execute("SELECT * FROM users WHERE user_name = %s OR email = %s", (username, email))
    if cursor.fetchone():
        return jsonify({"message": "Username or email already exists"}), 400

    user_id = str(uuid.uuid4())
    today = date.today()

    cursor.execute("""
        INSERT INTO users (id, user_name, user_password, email, created_at, update_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (user_id, username, password, email, today, today))
    conn.commit()

    return jsonify({"message": "User registered successfully"}), 200

# Đăng nhập
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    cursor.execute("""
        SELECT * FROM users WHERE user_name = %s AND user_password = %s
    """, (username, password))
    user = cursor.fetchone()

    if user:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
