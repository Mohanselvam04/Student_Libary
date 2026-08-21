import unittest
import requests
from config import BASE_URL

class TestCustomPasswordReset(unittest.TestCase):
    def setUp(self):
        self.verify_url = f"{BASE_URL}/verify-reset-code"
        self.confirm_url = f"{BASE_URL}/confirm-reset-password"

    def test_verify_reset_code_missing_code(self):
        """Test verify-reset-code returns 400 when oobCode is missing."""
        payload = {}
        response = requests.post(self.verify_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Reset code (oobCode) is required")

    def test_verify_reset_code_invalid_code(self):
        """Test verify-reset-code returns 400 when oobCode is invalid."""
        payload = {"oobCode": "invalid_oob_code_123"}
        response = requests.post(self.verify_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json())
        message = response.json()["message"].upper()
        self.assertTrue("INVALID" in message or "EXPIRED" in message or "FAIL" in message)

    def test_confirm_reset_password_missing_params(self):
        """Test confirm-reset-password returns 400 when oobCode or newPassword is missing."""
        # Missing newPassword
        payload1 = {"oobCode": "some_code"}
        response1 = requests.post(self.confirm_url, json=payload1)
        self.assertEqual(response1.status_code, 400)
        self.assertEqual(response1.json()["message"], "Reset code (oobCode) and new password are required")

        # Missing oobCode
        payload2 = {"newPassword": "Password123!"}
        response2 = requests.post(self.confirm_url, json=payload2)
        self.assertEqual(response2.status_code, 400)
        self.assertEqual(response2.json()["message"], "Reset code (oobCode) and new password are required")

    def test_confirm_reset_password_weak_password(self):
        """Test confirm-reset-password returns 400 when newPassword is too weak."""
        # Too short
        payload = {"oobCode": "some_code", "newPassword": "Ab1!"}
        response = requests.post(self.confirm_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must be at least 5 characters")

        # Missing uppercase
        payload = {"oobCode": "some_code", "newPassword": "password123!"}
        response = requests.post(self.confirm_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must contain an uppercase letter")

        # Missing special char
        payload = {"oobCode": "some_code", "newPassword": "Password123"}
        response = requests.post(self.confirm_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Password must contain a special character")

    def test_confirm_reset_password_invalid_code(self):
        """Test confirm-reset-password returns 400 when the oobCode is invalid."""
        payload = {
            "oobCode": "invalid_oob_code_123",
            "newPassword": "Password123!"
        }
        response = requests.post(self.confirm_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json())
        message = response.json()["message"].upper()
        self.assertTrue("INVALID" in message or "EXPIRED" in message or "FAIL" in message)

if __name__ == "__main__":
    unittest.main()
