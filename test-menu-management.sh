#!/bin/bash
# UI Automation Test Suite for Menu Management System

set -e

BASE_URL="http://localhost:3000"
ADMIN_BASE_URL="$BASE_URL/admin"
API_BASE_URL="$BASE_URL/api/admin/menu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test status
print_test_status() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name - $message"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name - $message"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to print section header
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function to make API request
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ "$method" = "GET" ]; then
        curl -s -X GET "$API_BASE_URL$endpoint"
    elif [ "$method" = "POST" ]; then
        curl -s -X POST -H "Content-Type: application/json" -d "$data" "$API_BASE_URL$endpoint"
    elif [ "$method" = "PATCH" ]; then
        curl -s -X PATCH -H "Content-Type: application/json" -d "$data" "$API_BASE_URL$endpoint"
    elif [ "$method" = "DELETE" ]; then
        curl -s -X DELETE "$API_BASE_URL$endpoint"
    fi
}

# Function to check if server is running
check_server() {
    print_section "Pre-flight Checks"
    
    if curl -s "$BASE_URL" > /dev/null; then
        print_test_status "Server Health Check" "PASS" "Server is running on $BASE_URL"
    else
        print_test_status "Server Health Check" "FAIL" "Server is not accessible at $BASE_URL"
        echo -e "${RED}ERROR: Please start the development server with 'npm run dev' before running tests${NC}"
        exit 1
    fi
}

# Function to test menu hierarchy API
test_menu_hierarchy() {
    print_section "Menu Hierarchy API Tests"
    
    # Test GET /api/admin/menu
    local response=$(api_request "GET" "")
    local success=$(echo "$response" | grep -o '"success":true' | head -1)
    
    if [ "$success" = '"success":true' ]; then
        print_test_status "Get Menu Hierarchy" "PASS" "API returned successful response"
        
        # Check if response contains expected structure
        local has_menu=$(echo "$response" | grep -o '"menu":{' | head -1)
        if [ "$has_menu" = '"menu":{' ]; then
            print_test_status "Menu Structure" "PASS" "Response contains menu object"
        else
            print_test_status "Menu Structure" "FAIL" "Response missing menu object"
        fi
    else
        print_test_status "Get Menu Hierarchy" "FAIL" "API request failed"
    fi
}

# Function to test category CRUD operations
test_category_crud() {
    print_section "Category CRUD Tests"
    
    # Get first menu ID for testing
    local menu_response=$(api_request "GET" "")
    local menu_id=$(echo "$menu_response" | grep -A 5 '"menu":{' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$menu_id" ]; then
        print_test_status "Category CRUD Setup" "FAIL" "Could not get menu ID for testing"
        return
    fi
    
    # Test CREATE Category
    local create_data="{\"menuId\":\"$menu_id\",\"name\":\"Test Category\",\"description\":\"Test Description\",\"sortOrder\":999}"
    local create_response=$(api_request "POST" "/categories" "$create_data")
    local create_success=$(echo "$create_response" | grep -o '"success":true')
    local category_id=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ "$create_success" = '"success":true' ] && [ -n "$category_id" ]; then
        print_test_status "Create Category" "PASS" "Category created successfully"
        
        # Test UPDATE Category
        local update_data="{\"name\":\"Updated Test Category\",\"description\":\"Updated Description\"}"
        local update_response=$(api_request "PATCH" "/categories/$category_id" "$update_data")
        local update_success=$(echo "$update_response" | grep -o '"success":true')
        
        if [ "$update_success" = '"success":true' ]; then
            print_test_status "Update Category" "PASS" "Category updated successfully"
        else
            print_test_status "Update Category" "FAIL" "Failed to update category"
        fi
        
        # Test DELETE Category
        local delete_response=$(api_request "DELETE" "/categories/$category_id")
        local delete_success=$(echo "$delete_response" | grep -o '"success":true')
        
        if [ "$delete_success" = '"success":true' ]; then
            print_test_status "Delete Category" "PASS" "Category deleted successfully"
        else
            print_test_status "Delete Category" "FAIL" "Failed to delete category"
        fi
    else
        print_test_status "Create Category" "FAIL" "Failed to create test category"
    fi
}

# Function to test product CRUD operations
test_product_crud() {
    print_section "Product CRUD Tests"
    
    # Get first category ID for testing
    local menu_response=$(api_request "GET" "")
    local category_id=""
    
    # Try to use jq if available, otherwise use grep
    if command -v jq >/dev/null 2>&1; then
        category_id=$(echo "$menu_response" | jq -r '.menu.categories[0].id' 2>/dev/null || echo "")
    fi
    
    # Fallback to grep if jq failed or unavailable
    if [ -z "$category_id" ] || [ "$category_id" = "null" ]; then
        # Look specifically for category objects with menuId field
        category_id=$(echo "$menu_response" | sed -n '/"categories":\[/,/\]/p' | grep -A 10 '"menuId"' | grep '"id"' | head -1 | sed 's/.*"id":"\([^"]*\)".*/\1/')
    fi
    
    if [ -z "$category_id" ]; then
        print_test_status "Product CRUD Setup" "FAIL" "Could not get category ID for testing"
        return
    fi
    
    # Test CREATE Product
    local create_data="{\"categoryId\":\"$category_id\",\"name\":\"Test Product\",\"description\":\"Test Product Description\",\"price\":19.99,\"sortOrder\":999}"
    local create_response=$(api_request "POST" "/products" "$create_data")
    local create_success=$(echo "$create_response" | grep -o '"success":true')
    local product_id=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ "$create_success" = '"success":true' ] && [ -n "$product_id" ]; then
        print_test_status "Create Product" "PASS" "Product created successfully"
        
        # Test UPDATE Product
        local update_data="{\"name\":\"Updated Test Product\",\"price\":24.99,\"isAvailable\":false}"
        local update_response=$(api_request "PATCH" "/products/$product_id" "$update_data")
        local update_success=$(echo "$update_response" | grep -o '"success":true')
        
        if [ "$update_success" = '"success":true' ]; then
            print_test_status "Update Product" "PASS" "Product updated successfully"
        else
            print_test_status "Update Product" "FAIL" "Failed to update product"
        fi
        
        # Test DELETE Product
        local delete_response=$(api_request "DELETE" "/products/$product_id")
        local delete_success=$(echo "$delete_response" | grep -o '"success":true')
        
        if [ "$delete_success" = '"success":true' ]; then
            print_test_status "Delete Product" "PASS" "Product deleted successfully"
        else
            print_test_status "Delete Product" "FAIL" "Failed to delete product"
        fi
    else
        print_test_status "Create Product" "FAIL" "Failed to create test product"
    fi
}

# Function to test product option CRUD operations
test_product_option_crud() {
    print_section "Product Option CRUD Tests"
    
    # First, create a test product for options
    local menu_response=$(api_request "GET" "")
    local category_id=""
    
    # Try to use jq if available, otherwise use grep
    if command -v jq >/dev/null 2>&1; then
        category_id=$(echo "$menu_response" | jq -r '.menu.categories[0].id' 2>/dev/null || echo "")
    fi
    
    # Fallback to grep if jq failed or unavailable
    if [ -z "$category_id" ] || [ "$category_id" = "null" ]; then
        # Look specifically for category objects with menuId field
        category_id=$(echo "$menu_response" | sed -n '/"categories":\[/,/\]/p' | grep -A 10 '"menuId"' | grep '"id"' | head -1 | sed 's/.*"id":"\([^"]*\)".*/\1/')
    fi
    
    if [ -z "$category_id" ]; then
        print_test_status "Product Option Setup" "FAIL" "Could not get category ID for testing"
        return
    fi
    
    # Create test product
    local product_data="{\"categoryId\":\"$category_id\",\"name\":\"Test Product for Options\",\"price\":15.99}"
    local product_response=$(api_request "POST" "/products" "$product_data")
    local product_id=$(echo "$product_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$product_id" ]; then
        print_test_status "Product Option Setup" "FAIL" "Could not create test product"
        return
    fi
    
    # Test CREATE Product Option
    local option_data="{\"productId\":\"$product_id\",\"name\":\"Size\",\"type\":\"RADIO\",\"isRequired\":true}"
    local option_response=$(api_request "POST" "/options" "$option_data")
    local option_success=$(echo "$option_response" | grep -o '"success":true')
    local option_id=$(echo "$option_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ "$option_success" = '"success":true' ] && [ -n "$option_id" ]; then
        print_test_status "Create Product Option" "PASS" "Product option created successfully"
        
        # Test CREATE Option Value
        local value_data="{\"name\":\"Large\",\"priceModifier\":2.50,\"isDefault\":true}"
        local value_response=$(api_request "POST" "/options/$option_id/values" "$value_data")
        local value_success=$(echo "$value_response" | grep -o '"success":true')
        local value_id=$(echo "$value_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ "$value_success" = '"success":true' ] && [ -n "$value_id" ]; then
            print_test_status "Create Option Value" "PASS" "Option value created successfully"
            
            # Test UPDATE Option Value
            local update_value_data="{\"name\":\"Extra Large\",\"priceModifier\":3.00}"
            local update_value_response=$(api_request "PATCH" "/options/$option_id/values/$value_id" "$update_value_data")
            local update_value_success=$(echo "$update_value_response" | grep -o '"success":true')
            
            if [ "$update_value_success" = '"success":true' ]; then
                print_test_status "Update Option Value" "PASS" "Option value updated successfully"
            else
                print_test_status "Update Option Value" "FAIL" "Failed to update option value"
            fi
            
            # Clean up option value
            api_request "DELETE" "/options/$option_id/values/$value_id" > /dev/null
        else
            print_test_status "Create Option Value" "FAIL" "Failed to create option value"
        fi
        
        # Test UPDATE Product Option
        local update_option_data="{\"name\":\"Size Options\",\"description\":\"Choose your size\"}"
        local update_option_response=$(api_request "PATCH" "/options/$option_id" "$update_option_data")
        local update_option_success=$(echo "$update_option_response" | grep -o '"success":true')
        
        if [ "$update_option_success" = '"success":true' ]; then
            print_test_status "Update Product Option" "PASS" "Product option updated successfully"
        else
            print_test_status "Update Product Option" "FAIL" "Failed to update product option"
        fi
        
        # Test DELETE Product Option
        local delete_option_response=$(api_request "DELETE" "/options/$option_id")
        local delete_option_success=$(echo "$delete_option_response" | grep -o '"success":true')
        
        if [ "$delete_option_success" = '"success":true' ]; then
            print_test_status "Delete Product Option" "PASS" "Product option deleted successfully"
        else
            print_test_status "Delete Product Option" "FAIL" "Failed to delete product option"
        fi
    else
        print_test_status "Create Product Option" "FAIL" "Failed to create product option"
    fi
    
    # Clean up test product
    api_request "DELETE" "/products/$product_id" > /dev/null
}

# Function to test error handling
test_error_handling() {
    print_section "Error Handling Tests"
    
    # Test invalid category creation (missing required fields)
    local invalid_category="{\"name\":\"\",\"description\":\"\"}"
    local invalid_response=$(api_request "POST" "/categories" "$invalid_category")
    local has_error=$(echo "$invalid_response" | grep -o '"error":')
    
    if [ -n "$has_error" ]; then
        print_test_status "Invalid Category Creation" "PASS" "API correctly rejected invalid data"
    else
        print_test_status "Invalid Category Creation" "FAIL" "API should reject invalid data"
    fi
    
    # Test non-existent resource access
    local fake_id="non-existent-id"
    local not_found_response=$(api_request "PATCH" "/categories/$fake_id" "{\"name\":\"Test\"}")
    local has_error=$(echo "$not_found_response" | grep -o '"error":')
    
    if [ -n "$has_error" ]; then
        print_test_status "Non-existent Resource Access" "PASS" "API correctly handled non-existent resource"
    else
        print_test_status "Non-existent Resource Access" "FAIL" "API should handle non-existent resources"
    fi
}

# Function to test UI responsiveness (basic page load tests)
test_ui_responsiveness() {
    print_section "UI Responsiveness Tests"
    
    # Test admin menu page load
    local admin_response=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE_URL/menu")
    
    if [ "$admin_response" = "200" ]; then
        print_test_status "Admin Menu Page Load" "PASS" "Page loaded successfully (HTTP 200)"
    else
        print_test_status "Admin Menu Page Load" "FAIL" "Page failed to load (HTTP $admin_response)"
    fi
    
    # Test main menu page load (if it exists)
    local menu_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/menu")
    
    if [ "$menu_response" = "200" ] || [ "$menu_response" = "404" ]; then
        print_test_status "Menu Page Accessibility" "PASS" "Page is accessible (no server errors)"
    else
        print_test_status "Menu Page Accessibility" "FAIL" "Server error (HTTP $menu_response)"
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}🧪 Menu Management System - UI Automation Test Suite${NC}"
    echo -e "${BLUE}================================================================${NC}"
    
    # Run all test suites
    check_server
    test_menu_hierarchy
    test_category_crud
    test_product_crud
    test_product_option_crud
    test_error_handling
    test_ui_responsiveness
    
    # Print final results
    echo -e "\n${BLUE}=== Test Results Summary ===${NC}"
    echo -e "Tests Run: $TESTS_RUN"
    echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! Menu management system is working correctly.${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please review the output above.${NC}"
        exit 1
    fi
}

# Run the test suite
main "$@"
