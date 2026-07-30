import unittest
import uuid
import requests
from config import BASE_URL

class TestRegister(unittest.TestCase):
    def setUp(self):
        self.register_url = f"{BASE_URL}/register"

    def generate_unique_email(self):
        return f"test_{uuid.uuid4().hex[:10]}@gmail.com"

    def test_register_student_success(self):
        """Test registration of a student (default role) with valid details."""
        email = self.generate_unique_email()
        payload = {
            "name": "Test Student",
            "email": email,
            "password": "Password123!",
            "role": "student"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 201)
        
        data = response.json()
        self.assertIn("token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], email)
        self.assertEqual(data["user"]["role"], "student")

    def test_register_instructor_success(self):
        """Test registration of an instructor with valid details."""
        email = self.generate_unique_email()
        payload = {
            "name": "Test Instructor",
            "email": email,
            "password": "Password123!",
            "role": "instructor"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 201)
        
        data = response.json()
        self.assertIn("token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], email)
        self.assertEqual(data["user"]["role"], "instructor")

    def test_register_admin_success(self):
        """Test registration of an admin with valid details."""
        email = self.generate_unique_email()
        payload = {
            "name": "Test Admin",
            "email": email,
            "password": "Password123!",
            "role": "admin"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 201)
        
        data = response.json()
        self.assertIn("token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], email)
        self.assertEqual(data["user"]["role"], "admin")

    def test_register_missing_fields(self):
        """Test validation error when name, email, or password is empty."""
        payloads = [
            {"email": "test@gmail.com", "password": "Password123!"},
            {"name": "No Email", "password": "Password123!"},
            {"name": "No Password", "email": "test@gmail.com"},
        ]
        for payload in payloads:
            response = requests.post(self.register_url, json=payload)
            self.assertEqual(response.status_code, 400)
            self.assertIn("message", response.json())
            self.assertEqual(response.json()["message"], "Name, email and password are required")

    def test_register_invalid_email_domain(self):
        """Test validation error when email is not a valid @gmail.com address."""
        payload = {
            "name": "Bad Email User",
            "email": "test@yahoo.com",
            "password": "Password123!",
            "role": "student"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Email must be a valid @gmail.com address")

    def test_register_weak_password_length(self):
        """Test validation error when password is less than 5 characters."""
        payload = {
            "name": "Short Pass User",
            "email": self.generate_unique_email(),
            "password": "P1!",
            "role": "student"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must be at least 5 characters")

    def test_register_weak_password_uppercase(self):
        """Test validation error when password contains no uppercase letter."""
        payload = {
            "name": "No Upper User",
            "email": self.generate_unique_email(),
            "password": "password123!",
            "role": "student"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must contain an uppercase letter")

    def test_register_weak_password_lowercase(self):
        """Test validation error when password contains no lowercase letter."""
        payload = {
            "name": "No Lower User",
            "email": self.generate_unique_email(),
            "password": "PASSWORD123!",
            "role": "student"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must contain a lowercase letter")

    def test_register_weak_password_number(self):
        """Test validation error when password contains no digit."""
        payload = {
            "name": "No Number User",
            "email": self.generate_unique_email(),
            "password": "Password!",
            "role": "student"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must contain a number")

    def test_register_weak_password_special_char(self):
        """Test validation error when password contains no special character."""
        payload = {
            "name": "No Special User",
            "email": self.generate_unique_email(),
            "password": "Password123",
            "role": "student"
        }
        response = requests.post(self.register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must contain a special character")

    def test_register_duplicate_email(self):
        """Test duplicate registration returns 400 error."""
        email = self.generate_unique_email()
        payload = {
            "name": "First User",
            "email": email,
            "password": "Password123!",
            "role": "student"
        }
        # First registration
        response1 = requests.post(self.register_url, json=payload)
        self.assertEqual(response1.status_code, 201)

        # Second registration with same email
        payload["name"] = "Second User"
        response2 = requests.post(self.register_url, json=payload)
        self.assertEqual(response2.status_code, 400)
        self.assertIn("message", response2.json())
        self.assertIn("exists", response2.json()["message"].lower())

if __name__ == "__main__":
    unittest.main()
