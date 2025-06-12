from flask import Flask, request, jsonify, make_response
import psycopg2
import uuid
from datetime import date
from flask_cors import CORS
from functools import wraps

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

    cursor.execute("SELECT * FROM users WHERE user_name = %s OR email = %s", (username, email))
    if cursor.fetchone():
        return jsonify({"message": "Tài khoản và mật khẩu đã tồn tại"}), 400

    user_id = str(uuid.uuid4())
    today = date.today()

    cursor.execute("""
        INSERT INTO users (id, user_name, user_password, email, created_at, update_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (user_id, username, password, email, today, today))
    conn.commit()

    return jsonify({"message": "Đăng ký tài khoản thành công!"}), 200

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
        return jsonify({"message": "Đăng nhập thành công!"}), 200
    else:
        return jsonify({"message": "Tài khoản hoặc mật khẩu không hợp lệ"}), 401

# Xóa account
@app.route('/user/delete', methods=['DELETE'])
def delete_account():
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    
    token = auth_header.split(' ')[1]

    data = request.get_json()
    username = data.get('user_name') if data else None

    if not username:
        return jsonify({'message': 'Missing username'}), 400
    
    try:
        cursor.execute("DELETE FROM users WHERE user_name = %s", (username,))
        conn.commit()
        return jsonify({'message': 'Tài khoản đã xóa thành công!'}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Hệ thống lỗi, vui lòng thử lại sau!'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
