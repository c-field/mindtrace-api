# TestFlight Encoding Issue Debug Guide

## Problem Summary
TestFlight users experiencing "Invalid response encoding" error during login, while development environments work fine.

## Root Cause Analysis

### Recent Changes That Could Cause This Issue:
1. **Supabase Authentication Integration** (July 8, 2025)
   - Changed login endpoint to use Supabase Auth API
   - Modified session handling to store UUID instead of numeric ID
   - Added users table query after auth

2. **UTF-8 Encoding Fixes** (July 13, 2025)
   - Added explicit `Content-Type: application/json; charset=utf-8` headers
   - Enhanced client-side response validation
   - Added UTF-8 validation functions

3. **CORS Configuration** (July 9, 2025)
   - Added CORS support for Capacitor iOS app
   - Configured specific origins for mobile communication

## Applied Fixes

### Server-Side Changes:
1. **Enhanced Response Headers**:
   ```typescript
   res.setHeader('Content-Type', 'application/json; charset=utf-8');
   res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Expires', '0');
   ```

2. **Production Logging**:
   - Added detailed logging for TestFlight debugging
   - Logs authentication attempts and responses
   - Tracks Supabase auth errors

3. **Improved Error Handling**:
   - Explicit JSON response formatting
   - Consistent UTF-8 encoding
   - Proper HTTP status codes

### Client-Side Changes:
1. **Enhanced Headers**:
   ```javascript
   headers: {
     "Content-Type": "application/json; charset=utf-8",
     "Accept": "application/json; charset=utf-8",
     "Cache-Control": "no-cache",
   }
   ```

2. **TestFlight Detection & Logging**:
   - Detects TestFlight environment
   - Comprehensive request/response logging
   - Enhanced error details

3. **Response Validation**:
   - Content-type validation
   - UTF-8 encoding checks
   - Enhanced error parsing

## Testing Instructions

### For TestFlight Users:
1. Enable Safari Developer Tools on iPhone
2. Connect to Mac and inspect console
3. Look for "TestFlight" prefixed log messages
4. Share console output if login fails

### Debug Log Patterns:
- `TestFlight login request:` - Request details
- `TestFlight login response:` - Response headers/status
- `TestFlight auth data parsed:` - Successful data
- `TestFlight auth error:` - Error details

## Environment Differences

### Development vs Production:
- Development: Direct localhost communication
- TestFlight: Capacitor bridge + HTTPS communication
- Production: Proper CORS and encoding required

### Key Differences:
1. **Network Stack**: Capacitor HTTP vs Native fetch
2. **SSL/TLS**: HTTPS required in production
3. **Session Handling**: Different cookie behavior
4. **Response Encoding**: Stricter validation needed

## Next Steps if Issue Persists:
1. Check TestFlight console logs
2. Verify Supabase environment variables
3. Test with different login credentials
4. Monitor server logs during login attempts