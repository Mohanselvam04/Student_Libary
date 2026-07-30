import sys
import os
import unittest

# Ensure the tests directory is in the import path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Check for requests module
try:
    import requests
except ImportError:
    print("=" * 60)
    print("ERROR: The 'requests' library is required to run the test suite.")
    print("Please install it by running the following command:")
    print("    pip install requests")
    print("=" * 60)
    sys.exit(1)

def run_all_tests():
    print("=" * 60)
    print("             STARTING AUTHENTICATION API TEST SUITE            ")
    print("=" * 60)
    
    # Discover all tests starting with test_ in the current directory
    loader = unittest.TestLoader()
    suite = loader.discover(
        start_dir=os.path.dirname(os.path.abspath(__file__)),
        pattern="test_*.py"
    )

    # Run tests using a verbose TextTestRunner
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\n" + "=" * 60)
    print("                       TEST SUITE SUMMARY                      ")
    print("=" * 60)
    print(f"Total Tests Run: {result.testsRun}")
    print(f"Passed: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors (Crashes/Exceptions): {len(result.errors)}")
    
    if not result.wasSuccessful():
        print("\n[RESULT] ❌ Test suite failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n[RESULT] ✅ All tests passed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    run_all_tests()
