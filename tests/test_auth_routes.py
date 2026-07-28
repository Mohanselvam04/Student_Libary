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

    def test_admin_card_visibility_flow(self):
        """Test fetching and updating admin card visibility."""
        visibility_url = f"{BASE_URL}/admin-card-visibility"
        
        # 1. Get default visibility (should be True)
        res = requests.get(visibility_url)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["visible"])

        # 2. Update without auth (should fail)
        res = requests.post(visibility_url, json={"visible": False})
        self.assertEqual(res.status_code, 401)

        # 3. Update with invalid credentials (should fail)
        res = requests.post(visibility_url, json={"visible": False, "email": "wrong@gmail.com", "password": "wrong"})
        self.assertEqual(res.status_code, 401)

        # 4. Update with valid admin credentials (should succeed)
        res = requests.post(visibility_url, json={"visible": False, "email": self.admin_email, "password": self.password})
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertFalse(res.json()["visible"])

        # Check it updated globally
        res = requests.get(visibility_url)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["visible"])

        # 5. Update with admin JWT token (should succeed)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = requests.post(visibility_url, json={"visible": True}, headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertTrue(res.json()["visible"])

        # Check it reverted back to True
        res = requests.get(visibility_url)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["visible"])

        # 6. Test Instructor card visibility
        inst_visibility_url = f"{BASE_URL}/instructor-card-visibility"
        
        # Get default (True)
        res = requests.get(inst_visibility_url)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["visible"])

        # Update without auth (should fail)
        res = requests.post(inst_visibility_url, json={"visible": False})
        self.assertEqual(res.status_code, 401)

        # Update with valid admin credentials (should succeed)
        res = requests.post(inst_visibility_url, json={"visible": False, "email": self.admin_email, "password": self.password})
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertFalse(res.json()["visible"])

        # Check it updated globally
        res = requests.get(inst_visibility_url)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["visible"])

        # Revert back with token (should succeed)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = requests.post(inst_visibility_url, json={"visible": True}, headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertTrue(res.json()["visible"])

        # 7. Test Student card visibility
        stud_visibility_url = f"{BASE_URL}/student-card-visibility"
        
        # Get default (True)
        res = requests.get(stud_visibility_url)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["visible"])

        # Update without auth (should fail)
        res = requests.post(stud_visibility_url, json={"visible": False})
        self.assertEqual(res.status_code, 401)

        # Update with valid admin credentials (should succeed)
        res = requests.post(stud_visibility_url, json={"visible": False, "email": self.admin_email, "password": self.password})
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertFalse(res.json()["visible"])

        # Check it updated globally
        res = requests.get(stud_visibility_url)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["visible"])

        # Revert back with token (should succeed)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = requests.post(stud_visibility_url, json={"visible": True}, headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertTrue(res.json()["visible"])

if __name__ == "__main__":
    unittest.main()
