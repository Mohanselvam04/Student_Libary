import unittest
import uuid
import requests
from config import BASE_URL

class TestLogin(unittest.TestCase):
    def setUp(self):
        self.login_url = f"{BASE_URL}/login"
        self.register_url = f"{BASE_URL}/register"

        # Register a test user for login operations
        self.email = f"login_test_{uuid.uuid4().hex[:10]}@gmail.com"
        self.password = "Password123!"
        self.name = "Login Tester"
        
        reg_payload = {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "role": "student"
        }
        res = requests.post(self.register_url, json=reg_payload)
        self.assertEqual(res.status_code, 201)

    def test_login_success(self):
        """Test successful login with correct email and password."""
        payload = {
            "email": self.email,
            "password": self.password
        }
        response = requests.post(self.login_url, json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], self.email)
        self.assertEqual(data["user"]["name"], self.name)
        self.assertEqual(data["user"]["role"], "student")

    def test_login_incorrect_password(self):
        """Test login failure with an incorrect password."""
        payload = {
            "email": self.email,
            "password": "WrongPassword123!"
        }
        response = requests.post(self.login_url, json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["message"], "Invalid credentials")

    def test_login_nonexistent_user(self):
        """Test login failure with a non-existent email address."""
        payload = {
            "email": "notexists_12345@gmail.com",
            "password": self.password
        }
        response = requests.post(self.login_url, json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["message"], "Invalid credentials")

    def test_login_missing_email(self):
        """Test login failure when email is missing."""
        payload = {
            "password": self.password
        }
        response = requests.post(self.login_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Email and password required")

    def test_login_missing_password(self):
        """Test login failure when password is missing."""
        payload = {
            "email": self.email
        }
        response = requests.post(self.login_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Email and password required")

if __name__ == "__main__":
    unittest.main()
