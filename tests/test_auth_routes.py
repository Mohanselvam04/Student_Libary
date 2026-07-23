import unittest
import uuid
import requests
from config import BASE_URL

class TestAuthRoutes(unittest.TestCase):
    def setUp(self):
        self.me_url = f"{BASE_URL}/me"
        self.redirect_url = f"{BASE_URL}/redirect"
        self.register_url = f"{BASE_URL}/register"

        # Unique identities for tests
        self.student_email = f"student_{uuid.uuid4().hex[:10]}@gmail.com"
        self.admin_email = f"admin_{uuid.uuid4().hex[:10]}@gmail.com"
        self.instructor_email = f"instructor_{uuid.uuid4().hex[:10]}@gmail.com"
        self.password = "Password123!"

        # Register student
        res_stu = requests.post(self.register_url, json={
            "name": "Stu Dent",
            "email": self.student_email,
            "password": self.password,
            "role": "student"
        })
        self.assertEqual(res_stu.status_code, 201)
        self.student_token = res_stu.json()["token"]

        # Register admin
        res_adm = requests.post(self.register_url, json={
            "name": "Ad Min",
            "email": self.admin_email,
            "password": self.password,
            "role": "admin"
        })
        self.assertEqual(res_adm.status_code, 201)
        self.admin_token = res_adm.json()["token"]

        # Register instructor
        res_inst = requests.post(self.register_url, json={
            "name": "Inst Ructor",
            "email": self.instructor_email,
            "password": self.password,
            "role": "instructor"
        })
        self.assertEqual(res_inst.status_code, 201)
        self.instructor_token = res_inst.json()["token"]

    def test_me_endpoint_success_student(self):
        """Test GET /me endpoint with a valid student token."""
        headers = {"Authorization": f"Bearer {self.student_token}"}
        response = requests.get(self.me_url, headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["email"], self.student_email)
        self.assertEqual(data["role"], "student")
        self.assertNotIn("password", data)

    def test_me_endpoint_success_admin(self):
        """Test GET /me endpoint with a valid admin token."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(self.me_url, headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["email"], self.admin_email)
        self.assertEqual(data["role"], "admin")

    def test_me_endpoint_missing_token(self):
        """Test GET /me endpoint without any Authorization header."""
        response = requests.get(self.me_url)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["message"], "Not authorized, no token")

    def test_me_endpoint_invalid_token(self):
        """Test GET /me endpoint with an invalid token."""
        headers = {"Authorization": "Bearer invalid_token_here_12345"}
        response = requests.get(self.me_url, headers=headers)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["message"], "Not authorized, token failed")

    def test_redirect_student(self):
        """Test GET /redirect returns /dashboard for students."""
        headers = {"Authorization": f"Bearer {self.student_token}"}
        response = requests.get(self.redirect_url, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["redirectTo"], "/dashboard")

    def test_redirect_instructor(self):
        """Test GET /redirect returns /dashboard for instructors."""
        headers = {"Authorization": f"Bearer {self.instructor_token}"}
        response = requests.get(self.redirect_url, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["redirectTo"], "/dashboard")

    def test_redirect_admin(self):
        """Test GET /redirect returns /admin for admins."""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(self.redirect_url, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["redirectTo"], "/admin")

    def test_redirect_unauthorized(self):
        """Test GET /redirect fails when not authorized."""
        response = requests.get(self.redirect_url)
        self.assertEqual(response.status_code, 401)

if __name__ == "__main__":
    unittest.main()
