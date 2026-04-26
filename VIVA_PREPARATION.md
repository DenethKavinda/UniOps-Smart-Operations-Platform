# UniOps VIVA Preparation Guide

## Notifications + Role Management + OAuth + Profile Features

---

## 📋 PART 1: OVERVIEW OF YOUR IMPLEMENTATION

### **What You've Built:**

#### 1. **Notifications Module** ✅

- **REST API Endpoints:**
  - `GET /api/notifications` - Fetch all notifications (List)
  - `POST /api/admin/notifications` - Create notification with file upload (Create)
  - `DELETE /api/admin/notifications/{id}` - Delete notification (Delete)
  - `GET /api/notifications/stream` - Real-time SSE streaming
  - `GET /api/notifications/{id}/document` - Download attachment

- **Database Persistence:**
  - `Notification` entity with JPA @Entity mapping
  - Fields: id, title, message, linkUrl, linkLabel, documentUrl, documentName, documentContentType, documentData (Blob), createdBy, createdAt
  - MySQL database with DDL auto-update

#### 2. **Role Management** ✅

- **User Roles:** STUDENT (default), ADMIN, STAFF, FACULTY
- **REST API Endpoints:**
  - `GET /api/admin/users` - List all users with role info
  - `PUT /api/admin/users/{userId}/role` - Update user role (Admin only)
  - Role-based endpoint protection with authorization checks
- **Authorization Features:**
  - Admin-only endpoints (`/admin/*`)
  - Admin dashboard with role statistics
  - User blocking mechanism

#### 3. **OAuth Integration** ✅

- **Google OAuth 2.0 Implementation:**
  - `POST /api/auth/google` - Google token-based login
  - JWT token validation using Google's `GoogleIdTokenVerifier`
  - Endpoint: `GET /api/auth/google-client-id` - Retrieves client ID from backend
- **Security:**
  - BCrypt password encoding for stored credentials
  - Google JWT verification before user creation/login

#### 4. **User Profile Management** ✅

- **REST API Endpoints:**
  - `GET /api/users/{userId}/profile` - View profile
  - `PUT /api/users/{userId}/profile` - Update profile (Name, bio, mobile, department, address, image)
  - `PUT /api/users/{userId}/password` - Change password
  - `POST /api/auth/password-reset` - Reset password
- **Frontend Integration:**
  - React component for profile editing
  - Profile completion percentage tracking
  - Image upload with Base64 encoding
  - Password change modal

---

## 🎓 PART 2: KEY CONCEPTS FOR VIVA

### **A. HTTP METHODS & REST Principles**

#### GET (Retrieve Data)

```
GET /api/notifications           → Retrieve all notifications (200 OK)
GET /api/users/{userId}/profile  → Fetch user profile (200 OK)
GET /api/admin/dashboard         → Admin overview stats (200 OK)
```

**Status Codes:** 200 OK, 404 Not Found

#### POST (Create Data)

```
POST /api/auth/register          → Create new user (200/201 Created)
POST /api/auth/login             → Authenticate user (200 OK)
POST /api/auth/google            → OAuth login (200 OK)
POST /api/admin/notifications    → Create notification (200 Created)
```

**Status Codes:** 200 OK, 201 Created, 400 Bad Request

#### PUT (Update Entire Resource)

```
PUT /api/users/{userId}/profile  → Replace profile data (200 OK)
PUT /api/users/{userId}/password → Change password (200 OK)
PUT /api/admin/users/{id}/role   → Update user role (200 OK)
```

**Status Codes:** 200 OK, 404 Not Found, 400 Bad Request

#### DELETE (Remove Resource)

```
DELETE /api/admin/notifications/{id} → Remove notification (200 OK)
DELETE /api/admin/users/{id}         → Delete user (200 OK)
```

**Status Codes:** 200 OK, 404 Not Found

#### PATCH (Partial Update) - Not used in your project, but know it!

```
PATCH /api/users/{userId}  → Update only some fields
```

### **B. API Naming Consistency**

Your implementation follows REST best practices:

- ✅ **Consistent Structure:** `/api/[resource]` or `/api/[action]/[resource]`
- ✅ **Resource-based:** `notifications`, `users`, `admin`
- ✅ **Hierarchical Paths:** `/api/users/{userId}/profile`
- ✅ **Admin Separation:** `/api/admin/*` for admin operations

```
Pattern Examples from Your Code:
/api/auth/register           ← Auth-specific action
/api/auth/login
/api/users/{id}/profile      ← Resource hierarchy
/api/admin/users             ← Admin-prefixed resources
/api/admin/dashboard
```

### **C. HTTP Status Codes in Your Implementation**

Your code returns consistent status codes:

| Code    | Usage            | Your Example                                           |
| ------- | ---------------- | ------------------------------------------------------ |
| **200** | Success          | `ResponseEntity.ok(...)` for all successful operations |
| **201** | Resource Created | Implied in notification creation                       |
| **400** | Bad Request      | `ResponseEntity.badRequest()` for validation errors    |
| **403** | Forbidden        | `HttpStatus.FORBIDDEN` for unauthorized access         |
| **404** | Not Found        | `ResourceNotFoundException` handling                   |
| **500** | Server Error     | Generic exception handler                              |

### **D. Error Handling & Meaningful Responses**

Your implementation uses a **consistent ApiResponse wrapper:**

```java
public class ApiResponse<T> {
    private boolean success;    // true/false
    private String message;     // Meaningful error message
    private T data;             // Actual data on success
}
```

**Examples from your code:**

```json
// Success Response
{
  "success": true,
  "message": "Notification created successfully.",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Email is already registered.",
  "data": null
}
```

**Error Handling Mechanisms:**

- `GlobalExceptionHandler` catches all exceptions
- Custom exceptions: `ResourceNotFoundException`, `IllegalArgumentException`, `IllegalStateException`
- Meaningful error messages instead of stack traces

---

## 📊 PART 3: DATABASE PERSISTENCE

### **1. JPA/Hibernate Configuration**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/uni_ops
spring.datasource.username=root
spring.datasource.password=***
spring.jpa.hibernate.ddl-auto=update     ← Auto-update schema
spring.jpa.show-sql=true
```

### **2. Entity Mapping**

Your entities use proper annotations:

```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Lob                    // Large Object for file storage
    private byte[] documentData;

    @PrePersist             // Auto-set timestamps
    public void onCreate() { ... }
}
```

### **3. Data Persistence Flow**

```
Frontend Form → Axios POST → Spring Controller
    ↓
Validation → Service Layer → Repository
    ↓
JPA Entity → Hibernate → MySQL Database
    ↓
Response back to Frontend (200 OK)
```

### **4. Repositories**

```java
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAll();
}

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

---

## 💡 PART 4: COMMON VIVA QUESTIONS & ANSWERS

### **📌 HTTP METHODS & REST**

**Q1: What are the HTTP methods you used and why?**

A: I used four main HTTP methods:

- **GET** - To retrieve data (notifications, user profiles). Returns 200 OK. Idempotent and safe.
- **POST** - To create new resources (register, login, notifications). Returns 200 OK or 201 Created.
- **PUT** - To update entire resources (update profile, change password). Returns 200 OK.
- **DELETE** - To remove resources (delete notifications). Returns 200 OK or 204 No Content.

Each method is used correctly according to REST principles:

- GET/DELETE are idempotent (repeated calls produce same result)
- POST is non-idempotent (creates new resource each time)
- PUT is idempotent (updating same field multiple times = same state)

---

**Q2: Why did you use PUT instead of PATCH for profile updates?**

A: In my implementation, I used PUT for profile updates because:

1. **Simplicity** - I'm replacing the entire profile object at once
2. **Idempotency** - Multiple PUT requests = same result
3. **Client requirement** - Easier for frontend to send complete object than partial updates
4. **Framework support** - Spring REST naturally supports PUT for object replacement

PATCH would be more efficient if:

- Only updating 1-2 fields (like just the bio)
- Working with large objects
- Want to minimize bandwidth

My choice: **PUT is appropriate for my use case**

---

**Q3: What HTTP status codes does your API return?**

A:

- **200 OK** - Successful GET, POST, PUT, DELETE operations (most common)
- **201 Created** - When creating new resource (implied in POST endpoints)
- **400 Bad Request** - Validation errors, invalid input, missing fields
  - Example: "Email is already registered"
  - Example: "Password must be 6+ characters"
- **403 Forbidden** - Access denied, insufficient permissions
  - Example: Non-admin trying to access admin endpoints
- **404 Not Found** - Resource doesn't exist
  - Example: User ID not found when fetching profile
- **500 Internal Server Error** - Unexpected server errors (caught by GlobalExceptionHandler)

All responses include meaningful messages in ApiResponse wrapper.

---

**Q4: How do you ensure meaningful error responses?**

A: I have three layers of error handling:

1. **Controller Level** - Validation before processing

   ```java
   if (request.getPassword().length() < 6) {
       throw new IllegalArgumentException("Password must be 6+ characters");
   }
   ```

2. **Global Exception Handler** - Catches all exceptions

   ```java
   @RestControllerAdvice
   public class GlobalExceptionHandler {
       @ExceptionHandler(IllegalArgumentException.class)
       public ResponseEntity<ApiResponse<Void>> handle(...) {
           return ResponseEntity.badRequest()
               .body(ApiResponse.error(ex.getMessage()));
       }
   }
   ```

3. **Consistent Response Format**
   ```json
   {
     "success": false,
     "message": "Specific error message for user",
     "data": null
   }
   ```

This ensures:

- Users get clear, actionable error messages
- Frontend can handle errors gracefully
- No stack traces exposed to clients
- Consistent format across all endpoints

---

### **📌 DATABASE PERSISTENCE**

**Q5: How does data persist in your application?**

A: I use **MySQL database with JPA/Hibernate**:

1. **Data Flow:**
   - Frontend sends data via REST API
   - Spring Controller receives request
   - Service validates and processes data
   - Repository saves to database via JPA
   - Hibernate generates SQL automatically

2. **Configuration:**
   - MySQL 8.0 database named `uni_ops`
   - `spring.jpa.hibernate.ddl-auto=update` auto-creates/updates tables
   - Connection pooling for efficiency

3. **Entity Mapping:**
   - Java classes annotated with `@Entity`
   - `@Id` marks primary key (auto-incremented)
   - `@Column` defines field constraints (nullable, length, unique)
   - `@Lob` for large objects (file storage)

4. **Example - Notification:**
   ```java
   @Entity
   @Table(name = "notifications")
   public class Notification {
       @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @Column(nullable = false, length = 120)
       private String title;

       @Lob
       private byte[] documentData;  // Stores uploaded file
   }
   ```

---

**Q6: What happens when you create a notification with a file?**

A:

1. Frontend sends `multipart/form-data` POST request with file
2. Controller receives file as `MultipartFile`
3. Service processes the file:
   ```java
   - Reads file bytes: Files.readAllBytes()
   - Stores metadata: filename, contentType
   - Stores binary data: byte[] in database
   ```
4. Notification entity saved with document data
5. Database stores:
   - documentName: "report.pdf"
   - documentContentType: "application/pdf"
   - documentData: [binary file content]

**Retrieval:**

- GET `/api/notifications/{id}/document`
- Service retrieves byte[] from DB
- Returns as downloadable file with correct MIME type

---

**Q7: How do you ensure data integrity?**

A:

1. **Database Constraints:**

   ```java
   @Column(nullable = false)        // NOT NULL constraint
   @Column(unique = true)           // UNIQUE constraint
   @Column(length = 120)            // VARCHAR length limit
   ```

2. **Validation in Code:**

   ```java
   if (email == null || !email.contains("@")) {
       throw new IllegalArgumentException("Invalid email");
   }
   ```

3. **Unique Email Enforcement:**

   ```java
   if (userRepository.existsByEmail(email)) {
       throw new IllegalArgumentException("Email already registered");
   }
   ```

4. **Exception Handling:**
   ```java
   @ExceptionHandler(DataIntegrityViolationException.class)
   public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(...) {
       return ResponseEntity.badRequest()
           .body(ApiResponse.error("Data violates constraints"));
   }
   ```

---

### **📌 ROLE MANAGEMENT**

**Q8: How do you implement role-based access control?**

A:

1. **Role Enum:**

   ```java
   public enum UserRole {
       STUDENT, ADMIN, STAFF, FACULTY
   }
   ```

2. **User Entity:**

   ```java
   @Enumerated(EnumType.STRING)
   @Column(nullable = false)
   private UserRole role = UserRole.STUDENT;  // Default role
   ```

3. **Admin-Only Endpoints:**

   ```java
   @PostMapping("/admin/notifications")   // Admin endpoint
   public ResponseEntity<...> createNotification(...) {
       // Only admins can call this
   }
   ```

4. **Role Checking in Service:**

   ```java
   public void updateUserRole(Long userId, UpdateRoleRequest request) {
       User user = userRepository.findById(userId)
           .orElseThrow(() -> new ResourceNotFoundException(...));

       user.setRole(UserRole.valueOf(request.getRole()));
       userRepository.save(user);
   }
   ```

5. **Dashboard Access:**
   ```java
   @GetMapping("/admin/dashboard")
   public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
       // Only admins access this
   }
   ```

---

**Q9: What security measures do you have for role management?**

A:

1. **Default Role Assignment:**
   - New users get STUDENT role by default
   - Prevents accidental admin creation

2. **Validation:**
   - Admin can update roles via API
   - Roles are validated against enum values
   - Invalid roles rejected

3. **Endpoint Segregation:**
   - Admin operations under `/api/admin/*`
   - Clear naming indicates access restrictions
   - Service layer handles authorization

4. **Audit Trail:**
   - `createdAt` timestamp records when user created
   - `updatedAt` could track role changes
   - `loginCount` and `lastLoginAt` track activity

---

### **📌 OAUTH INTEGRATION**

**Q10: How did you implement Google OAuth 2.0?**

A:

1. **Configuration:**

   ```properties
   google.client-id=553783200754-ej3jtvh7p1q6qh37ift8pivae881b0k9.apps.googleusercontent.com
   ```

2. **Token Verification:**

   ```java
   GoogleIdTokenVerifier googleIdTokenVerifier =
       buildGoogleVerifier(clientId);
   ```

3. **Login Flow:**

   ```
   Frontend:
   1. User clicks "Login with Google"
   2. Google OAuth popup opens
   3. User authenticates with Google
   4. Frontend receives Google JWT token
   5. Sends token to: POST /api/auth/google

   Backend:
   1. Verify JWT signature with Google's public key
   2. Check token validity and expiration
   3. Extract user email from token
   4. Create or update user in database
   5. Return AuthResponse with user details
   ```

4. **Implementation:**

   ```java
   @PostMapping("/auth/google")
   public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
           @RequestBody GoogleAuthRequest request) {
       AuthResponse response = userService.loginWithGoogle(request);
       return ResponseEntity.ok(
           ApiResponse.success("Google login successful.", response));
   }
   ```

5. **Verification Process:**
   ```java
   GoogleIdToken idToken = googleIdTokenVerifier.verify(request.getToken());
   if (idToken != null) {
       String email = idToken.getPayload().getEmail();
       // Create/update user in database
   }
   ```

---

**Q11: Why is Google OAuth important?**

A:

1. **Security Benefits:**
   - No password storage for Google users
   - Delegated to Google's secure authentication
   - Reduces phishing attacks

2. **User Convenience:**
   - One-click sign-in
   - No need to remember another password
   - Faster registration

3. **Trust Factor:**
   - Users trust Google's authentication
   - Pre-existing Gmail accounts

---

### **📌 PROFILE MANAGEMENT**

**Q12: How does the profile update feature work?**

A:

1. **Endpoint:**

   ```java
   @PutMapping("/users/{userId}/profile")
   public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
           @PathVariable Long userId,
           @RequestBody UpdateProfileRequest request) {
       return ResponseEntity.ok(ApiResponse.success(
           "Profile updated successfully.",
           userService.updateUserProfile(userId, request)));
   }
   ```

2. **Updatable Fields:**
   - name
   - profileImageUrl (Base64 encoded image)
   - address
   - mobileNumber
   - department
   - bio

3. **Frontend Implementation:**

   ```javascript
   const handleSaveProfile = async (e) => {
       const response = await api.put(`/users/${user.id}/profile`, {
           name: form.name,
           profileImageUrl: form.profileImageUrl,
           address: form.address,
           mobileNumber: form.mobileNumber,
           department: form.department,
           bio: form.bio,
       });
   ```

4. **Image Handling:**
   - Frontend reads file as Base64
   - Sends as string in JSON
   - Backend stores in database
   - Sent back as data URL for display

---

**Q13: How do you handle password changes?**

A:

1. **Change Password Endpoint:**

   ```java
   @PutMapping("/users/{userId}/password")
   public ResponseEntity<ApiResponse<Void>> changePassword(
           @PathVariable Long userId,
           @RequestBody ChangePasswordRequest request) {
       userService.changePassword(userId, request);
       return ResponseEntity.ok(ApiResponse.success(
           "Password changed successfully.", null));
   }
   ```

2. **Validation:**
   - Current password verification with BCrypt
   - New password validation (6+ characters)
   - Confirmation matching

3. **Security:**
   - BCrypt hashing: `passwordEncoder.encode(newPassword)`
   - Old password never exposed
   - New password stored securely

4. **Password Reset (Forgot Password):**
   ```java
   @PostMapping("/auth/password-reset")
   public ResponseEntity<ApiResponse<Void>> resetPassword(
           @RequestBody ResetPasswordRequest request) {
       userService.resetPassword(request);
       return ResponseEntity.ok(ApiResponse.success(
           "Password has been reset successfully.", null));
   }
   ```

---

### **📌 ADVANCED QUESTIONS**

**Q14: How does your API handle concurrent requests?**

A:

1. **Spring Boot Concurrency:**
   - Tomcat thread pool handles multiple requests
   - Each request in separate thread
   - No thread safety issues with stateless endpoints

2. **Database Connection Pooling:**
   - HikariCP (default in Spring Boot)
   - Reuses database connections
   - Prevents connection exhaustion

3. **Entity Manager Thread Safety:**
   - JPA Entity Manager is thread-local
   - Safe for concurrent requests

---

**Q15: What is your API versioning strategy?**

A:
Currently: `/api/[endpoint]`

**Future improvements could be:**

- `/api/v1/notifications`
- `/api/v2/notifications`

This allows backward compatibility when changing API structure.

---

**Q16: How do you secure sensitive data?**

A:

1. **Passwords:**
   - BCrypt hashing with salt
   - Never stored in plain text
   - Never returned in responses

2. **Email:**
   - Unique constraint prevents duplicates
   - Validated format

3. **JWT/OAuth Tokens:**
   - Verified server-side
   - Not stored in database for OAuth users

4. **CORS Configuration:**
   - Restricts which frontends can access API
   - Prevents unauthorized cross-origin requests

---

**Q17: How do you handle file uploads safely?**

A:

```java
@ExceptionHandler({MultipartException.class, MaxUploadSizeExceededException.class})
public ResponseEntity<ApiResponse<Void>> handleMultipart(Exception ex) {
    return ResponseEntity.badRequest()
        .body(ApiResponse.error(
            "Invalid file upload. Please try again with a valid file."));
}
```

1. **Size Validation:**
   - `MaxUploadSizeExceededException` catches large files
   - Prevents server overload

2. **Type Validation:**
   - Checks MIME type
   - Stores content-type with file

3. **Storage:**
   - Binary data stored in MySQL BLOB
   - Not stored on filesystem (safer)

---

**Q18: How would you scale this application?**

A:

**Short term:**

1. Add database indexes on frequently searched fields
2. Implement caching (Redis) for repeated queries
3. Connection pooling optimization

**Long term:**

1. Microservices: Separate notification, user, auth services
2. Message queue (RabbitMQ/Kafka) for async operations
3. Distributed caching layer
4. Database replication for high availability

---

## 🎯 PART 5: HOW TO FACE THE VIVA

### **1. Opening Statement** (30 seconds)

```
"I developed four key features for the UniOps project:

1. **Notifications** - A REST API that allows admins to create
   and manage notifications with file attachments, stored in MySQL,
   with real-time streaming via SSE.

2. **Role Management** - A role-based access control system with
   four roles (STUDENT, ADMIN, STAFF, FACULTY), where admins can
   manage user roles through REST endpoints.

3. **OAuth Integration** - Google OAuth 2.0 authentication that
   verifies JWT tokens and creates users in the database without
   storing passwords.

4. **Profile Management** - Users can update their profiles
   (name, bio, address, mobile, department, image) and change
   passwords securely using BCrypt hashing.

All features follow REST best practices with proper HTTP methods,
status codes, meaningful error responses, and MySQL data persistence."
```

### **2. During Technical Discussion**

**Be prepared to:**

- ✅ Explain your code line-by-line if asked
- ✅ Draw architecture diagrams
- ✅ Explain data flow from frontend to database
- ✅ Justify your design choices
- ✅ Discuss tradeoffs (PUT vs PATCH, JWT vs Sessions, etc.)
- ✅ Acknowledge limitations and improvements

### **3. Response Tips**

| Question Type                | Strategy                                                |
| ---------------------------- | ------------------------------------------------------- |
| **"Why did you...?"**        | Explain the business reason and technical benefit       |
| **"Show me the code"**       | Have the files ready, explain line by line              |
| **"How would you improve?"** | Mention scalability, security, performance improvements |
| **"What if...?"**            | Walk through the scenario, identify potential issues    |
| **"How do you handle X?"**   | Explain your solution, mention edge cases               |

### **4. Confidence Boosters**

- ✅ You have **proper REST API design** with all CRUD operations
- ✅ You use **meaningful error messages** with status codes
- ✅ You have **database persistence** with JPA/Hibernate
- ✅ You implement **security** (BCrypt, OAuth, validation)
- ✅ You practice **clean code** with services, repositories, DTOs
- ✅ You have **real OAuth implementation** (Google)
- ✅ You handle **file uploads** (multipart form data)
- ✅ You use **role-based access control**

---

## 📚 PART 6: CODE SNIPPETS TO MEMORIZE

### **Most Important Code to Know**

#### ApiResponse Pattern

```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String msg, T data) {
        return new ApiResponse<>(true, msg, data);
    }

    public static <T> ApiResponse<T> error(String msg) {
        return new ApiResponse<>(false, msg, null);
    }
}
```

#### HTTP Methods Summary

```
GET    /api/notifications        → Retrieve (200)
POST   /api/admin/notifications  → Create (200/201)
PUT    /api/users/{id}/profile   → Update (200)
DELETE /api/admin/notifications/{id} → Delete (200)
```

#### Entity with JPA

```java
@Entity @Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

#### Global Exception Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handle(Exception ex) {
        return ResponseEntity.status(500)
            .body(ApiResponse.error(ex.getMessage()));
    }
}
```

---

## 🎬 FINAL TIPS FOR VIVA DAY

1. **Before Viva:**
   - Review your code once more
   - Practice explaining endpoints
   - Draw system architecture
   - Test your application locally

2. **During Viva:**
   - Speak clearly and confidently
   - Don't rush your answers
   - Provide examples from your code
   - Ask for clarification if unsure
   - Show your implementation (have IDE ready)

3. **Common Tricky Questions:**
   - "Why not use PATCH?" → Explain simplicity vs efficiency
   - "Why MySQL?" → Relational data, better for this project
   - "How do you prevent SQL injection?" → Use JPA parameterized queries
   - "What about authentication?" → OAuth + traditional login implemented

---

## ✨ YOU'VE GOT THIS! 🚀

Your implementation is solid. You have:

- ✅ Proper REST API design
- ✅ Database persistence
- ✅ Error handling
- ✅ Security measures
- ✅ Real OAuth integration
- ✅ Clean architecture

**Good luck with your viva!** 🎓
