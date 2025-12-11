#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class DFenceAPITester:
    def __init__(self, base_url="https://d-fence-wheelspa.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_warranty_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    details = f"Status: {response.status_code}"
                    if method == 'POST' and 'id' in response_data:
                        details += f", ID: {response_data['id']}"
                except:
                    response_data = {}
                    details = f"Status: {response.status_code}"
            else:
                try:
                    error_data = response.json()
                    details = f"Expected {expected_status}, got {response.status_code}. Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:100]}"
                response_data = {}

            self.log_test(name, success, details)
            return success, response_data

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@dfence.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": "Test User",
                "email": test_email,
                "password": "Test123!"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "test@dfence.com",
                "password": "Test123!"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False
        
        success, response = self.run_test("Get Current User", "GET", "auth/me", 200)
        return success

    def test_create_warranty(self):
        """Test warranty creation"""
        if not self.token:
            self.log_test("Create Warranty", False, "No token available")
            return False

        warranty_data = {
            "customer_name": "John Doe",
            "customer_email": "john.doe@example.com",
            "customer_phone": "+91 98765 43210",
            "vehicle_make": "BMW",
            "vehicle_model": "M3",
            "vehicle_year": "2024",
            "vehicle_vin": "WBS8M9C51N5K12345",
            "vehicle_color": "Alpine White",
            "ppf_product": "XPEL Ultimate Plus",
            "ppf_coverage": "Full Body",
            "installation_date": datetime.now().isoformat(),
            "warranty_years": 5
        }

        success, response = self.run_test(
            "Create Warranty",
            "POST",
            "warranties",
            200,
            data=warranty_data
        )
        
        if success and 'id' in response:
            self.created_warranty_id = response['id']
            return True
        return False

    def test_get_warranties(self):
        """Test get warranties list"""
        if not self.token:
            self.log_test("Get Warranties List", False, "No token available")
            return False
        
        success, response = self.run_test("Get Warranties List", "GET", "warranties", 200)
        return success

    def test_get_warranty_by_id(self):
        """Test get warranty by ID"""
        if not self.token or not self.created_warranty_id:
            self.log_test("Get Warranty by ID", False, "No token or warranty ID available")
            return False
        
        success, response = self.run_test(
            "Get Warranty by ID",
            "GET",
            f"warranties/{self.created_warranty_id}",
            200
        )
        return success

    def test_warranty_search(self):
        """Test warranty search functionality"""
        if not self.token:
            self.log_test("Warranty Search", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Warranty Search",
            "GET",
            "warranties?search=John",
            200
        )
        return success

    def test_warranty_status_filter(self):
        """Test warranty status filtering"""
        if not self.token:
            self.log_test("Warranty Status Filter", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Warranty Status Filter",
            "GET",
            "warranties?status_filter=active",
            200
        )
        return success

    def test_public_warranty_verification(self):
        """Test public warranty verification (no auth required)"""
        # First create a warranty to verify
        if not self.created_warranty_id:
            self.log_test("Public Warranty Verification", False, "No warranty created to verify")
            return False
        
        # Get the warranty code first
        if self.token:
            success, warranty_data = self.run_test(
                "Get Warranty for Verification",
                "GET",
                f"warranties/{self.created_warranty_id}",
                200
            )
            
            if success and 'warranty_code' in warranty_data:
                warranty_code = warranty_data['warranty_code']
                
                # Test verification without token
                old_token = self.token
                self.token = None  # Remove token for public endpoint
                
                success, response = self.run_test(
                    "Public Warranty Verification",
                    "GET",
                    f"verify/{warranty_code}",
                    200
                )
                
                self.token = old_token  # Restore token
                return success
        
        return False

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        if not self.token:
            self.log_test("Dashboard Stats", False, "No token available")
            return False
        
        success, response = self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)
        return success

    def test_warranty_pdf_generation(self):
        """Test warranty PDF generation"""
        if not self.token or not self.created_warranty_id:
            self.log_test("Warranty PDF Generation", False, "No token or warranty ID available")
            return False
        
        url = f"{self.base_url}/warranties/{self.created_warranty_id}/pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            if success:
                details = f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}"
            else:
                details = f"Expected PDF response, got status {response.status_code}, content-type: {response.headers.get('content-type')}"
            
            self.log_test("Warranty PDF Generation", success, details)
            return success
            
        except requests.exceptions.RequestException as e:
            self.log_test("Warranty PDF Generation", False, f"Request failed: {str(e)}")
            return False

    def test_send_warranty_email(self):
        """Test warranty email sending"""
        if not self.token or not self.created_warranty_id:
            self.log_test("Send Warranty Email", False, "No token or warranty ID available")
            return False
        
        success, response = self.run_test(
            "Send Warranty Email",
            "POST",
            f"warranties/{self.created_warranty_id}/send-email",
            200
        )
        return success

    def test_delete_warranty(self):
        """Test warranty deletion"""
        if not self.token or not self.created_warranty_id:
            self.log_test("Delete Warranty", False, "No token or warranty ID available")
            return False
        
        success, response = self.run_test(
            "Delete Warranty",
            "DELETE",
            f"warranties/{self.created_warranty_id}",
            200
        )
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print(f"\n🔍 Starting D-Fence API Tests...")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)

        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test authentication
        if not self.test_user_registration():
            # If registration fails, try login with existing user
            self.test_user_login()
        
        self.test_get_current_user()
        
        # Test warranty operations
        self.test_create_warranty()
        self.test_get_warranties()
        self.test_get_warranty_by_id()
        self.test_warranty_search()
        self.test_warranty_status_filter()
        
        # Test public verification
        self.test_public_warranty_verification()
        
        # Test dashboard
        self.test_dashboard_stats()
        
        # Test PDF and email
        self.test_warranty_pdf_generation()
        self.test_send_warranty_email()
        
        # Test deletion (last as it removes the warranty)
        self.test_delete_warranty()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = DFenceAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())