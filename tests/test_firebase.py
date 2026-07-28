import unittest
import requests
from config import BASE_URL

class TestFirebase(unittest.TestCase):
    def setUp(self):
        self.fb_login_url = f"{BASE_URL}/firebase-login"
        self.fb_register_url = f"{BASE_URL}/firebase-register"

    def test_firebase_login_missing_token(self):
        """Test firebase-login returns 400 when idToken is missing."""
        payload = {}
        response = requests.post(self.fb_login_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Firebase idToken required")

    def test_firebase_login_invalid_token(self):
        """Test firebase-login returns 400 when an invalid/expired token is provided."""
        payload = {"idToken": "invalid_or_expired_mock_token_123"}
        response = requests.post(self.fb_login_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json())
        message = response.json()["message"].upper()
        self.assertTrue(
            "INVALID" in message or "FAILED" in message or "MALFORMED" in message or "EXPIRED" in message or "KEY" in message,
            f"Expected error message, got: {message}"
        )

    def test_firebase_register_missing_token(self):
        """Test firebase-register returns 400 when idToken is missing."""
        payload = {"name": "Firebase User"}
        response = requests.post(self.fb_register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "idToken and name are required")

    def test_firebase_register_missing_name(self):
        """Test firebase-register returns 400 when name is missing."""
        payload = {"idToken": "mock_token_123"}
        response = requests.post(self.fb_register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "idToken and name are required")

    def test_firebase_register_invalid_token(self):
        """Test firebase-register returns 400 when the provided idToken is invalid."""
        payload = {
            "idToken": "invalid_or_expired_mock_token_123",
            "name": "Firebase User",
            "role": "student"
        }
        response = requests.post(self.fb_register_url, json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json())
        message = response.json()["message"].upper()
        self.assertTrue(
            "INVALID" in message or "FAILED" in message or "MALFORMED" in message or "EXPIRED" in message or "KEY" in message,
            f"Expected error message, got: {message}"
        )

if __name__ == "__main__":
    unittest.main()
