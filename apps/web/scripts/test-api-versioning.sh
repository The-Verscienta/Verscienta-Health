#!/bin/bash

# API Versioning and CORS Test Script
#
# Tests the API versioning and CORS configuration
# Usage: ./scripts/test-api-versioning.sh [base-url]
#
# Examples:
#   ./scripts/test-api-versioning.sh                    # Test localhost:3000
#   ./scripts/test-api-versioning.sh https://verscienta.com  # Test production

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL (default to localhost)
BASE_URL="${1:-http://localhost:3000}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   API Versioning & CORS Test Suite    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Testing: ${BASE_URL}${NC}"
echo ""

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="$3"
  local expected_header="$4"
  local expected_value="$5"
  local extra_args="${6:-}"

  echo -e "${BLUE}Testing:${NC} $name"

  # Make request
  response=$(curl -s -w "\n%{http_code}" $extra_args "$url")
  status_code=$(echo "$response" | tail -n 1)
  headers=$(curl -s -I $extra_args "$url")

  # Check status code
  if [ "$status_code" == "$expected_status" ]; then
    echo -e "  ${GREEN}✓${NC} Status: $status_code"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} Status: Expected $expected_status, got $status_code"
    ((FAILED++))
    return
  fi

  # Check header (if specified)
  if [ -n "$expected_header" ]; then
    if echo "$headers" | grep -q "$expected_header: $expected_value"; then
      echo -e "  ${GREEN}✓${NC} Header: $expected_header = $expected_value"
      ((PASSED++))
    else
      echo -e "  ${RED}✗${NC} Header: $expected_header not found or incorrect"
      echo -e "     Expected: $expected_value"
      echo -e "     Headers: $(echo "$headers" | grep "$expected_header" || echo 'Not found')"
      ((FAILED++))
    fi
  fi

  echo ""
}

# 1. Test API Version 1 (URL path)
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo -e "${YELLOW}  API Versioning Tests${NC}"
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo ""

test_endpoint \
  "V1 via URL path" \
  "$BASE_URL/api/v1/mobile/config" \
  "200" \
  "X-Api-Version" \
  "1"

# 2. Test API Version 1 (header)
test_endpoint \
  "V1 via header" \
  "$BASE_URL/api/mobile/config" \
  "200" \
  "X-Api-Version" \
  "1" \
  "-H 'X-Api-Version: 1'"

# 3. Test API Version 1 (query parameter)
test_endpoint \
  "V1 via query param" \
  "$BASE_URL/api/mobile/config?api_version=1" \
  "200" \
  "X-Api-Version" \
  "1"

# 4. Test default version (should be v1)
test_endpoint \
  "Default version" \
  "$BASE_URL/api/mobile/config" \
  "200" \
  "X-Api-Version" \
  "1"

# 5. Test unsupported version (v2)
test_endpoint \
  "Unsupported version (v2)" \
  "$BASE_URL/api/v2/mobile/config" \
  "501" \
  "" \
  ""

# 6. Test invalid version (v0)
test_endpoint \
  "Invalid version (v0)" \
  "$BASE_URL/api/v0/mobile/config" \
  "400" \
  "" \
  ""

# 7. Test version headers present
echo -e "${BLUE}Testing:${NC} Version headers present"
headers=$(curl -s -I "$BASE_URL/api/v1/mobile/config")

check_header() {
  local header="$1"
  if echo "$headers" | grep -q "$header:"; then
    echo -e "  ${GREEN}✓${NC} $header present"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} $header missing"
    ((FAILED++))
  fi
}

check_header "X-Api-Version"
check_header "X-Api-Supported-Versions"
check_header "X-Api-Latest-Version"
check_header "X-Api-Deprecation"
echo ""

# CORS Tests
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo -e "${YELLOW}  CORS Tests${NC}"
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo ""

# 8. Test CORS - Capacitor origin
echo -e "${BLUE}Testing:${NC} CORS with Capacitor origin"
cors_response=$(curl -s -I "$BASE_URL/api/v1/mobile/config" \
  -H "Origin: capacitor://localhost" \
  -H "Access-Control-Request-Method: GET")

if echo "$cors_response" | grep -q "Access-Control-Allow-Origin: capacitor://localhost"; then
  echo -e "  ${GREEN}✓${NC} Capacitor origin allowed"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Capacitor origin not allowed"
  ((FAILED++))
fi
echo ""

# 9. Test CORS - Localhost origin (dev)
echo -e "${BLUE}Testing:${NC} CORS with localhost origin"
cors_response=$(curl -s -I "$BASE_URL/api/v1/mobile/config" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET")

if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
  echo -e "  ${GREEN}✓${NC} Localhost origin allowed"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Localhost origin not allowed"
  ((FAILED++))
fi
echo ""

# 10. Test CORS - OPTIONS preflight
echo -e "${BLUE}Testing:${NC} CORS OPTIONS preflight"
cors_response=$(curl -s -w "\n%{http_code}" -X OPTIONS "$BASE_URL/api/v1/mobile/config" \
  -H "Origin: capacitor://localhost" \
  -H "Access-Control-Request-Method: GET")

status_code=$(echo "$cors_response" | tail -n 1)
if [ "$status_code" == "204" ] || [ "$status_code" == "200" ]; then
  echo -e "  ${GREEN}✓${NC} OPTIONS preflight works (status: $status_code)"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} OPTIONS preflight failed (status: $status_code)"
  ((FAILED++))
fi
echo ""

# 11. Test CORS headers present
echo -e "${BLUE}Testing:${NC} CORS headers present"
cors_headers=$(curl -s -I "$BASE_URL/api/v1/mobile/config" \
  -H "Origin: capacitor://localhost")

check_cors_header() {
  local header="$1"
  if echo "$cors_headers" | grep -q "$header:"; then
    echo -e "  ${GREEN}✓${NC} $header present"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} $header missing"
    ((FAILED++))
  fi
}

check_cors_header "Access-Control-Allow-Origin"
check_cors_header "Access-Control-Allow-Credentials"
check_cors_header "Access-Control-Allow-Methods"
check_cors_header "Access-Control-Allow-Headers"
echo ""

# Payload REST API Tests
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo -e "${YELLOW}  Payload REST API Tests${NC}"
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo ""

# 12. Test Payload herbs endpoint (without versioning)
test_endpoint \
  "Payload REST API (no versioning)" \
  "$BASE_URL/admin/api/herbs?limit=1" \
  "200" \
  "" \
  ""

# Summary
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo -e "${YELLOW}  Test Summary${NC}"
echo -e "${YELLOW}══════════════════════════════════════${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
echo -e "Total Tests: ${BLUE}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║         ALL TESTS PASSED! ✓            ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════╗${NC}"
  echo -e "${RED}║         SOME TESTS FAILED ✗            ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════╝${NC}"
  exit 1
fi
