# Code Snippets Reference - Be Ready to Explain These!

## 🎯 KEY CODE SNIPPETS FROM YOUR PROJECT

### 1. REST ENDPOINTS & HTTP METHODS

#### **GET - Retrieve Notifications**

```java
@GetMapping("/notifications")
public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
    return ResponseEntity.ok(
        ApiResponse.success(
            "Notifications loaded successfully.",
            notificationService.getAll()
        )
    );
}
```

**Explanation for viva:**

- **HTTP Method:** GET (safe, idempotent)
- **Endpoint:** `/api/notifications`
- **Status Code:** 200 OK
- **Response:** List of notifications wrapped in ApiResponse
- **Use Case:** Fetch all notifications for display

---

#### **POST - Create Notification with File**

```java
@PostMapping(value = "/admin/notifications",
             consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ApiResponse<NotificationResponse>> createNotificationWithFile(
        @RequestParam String title,
        @RequestParam String message,
        @RequestParam(required = false) MultipartFile document) {

    CreateNotificationRequest request = new CreateNotificationRequest();
    request.setTitle(title);
    request.setMessage(message);

    return ResponseEntity.ok(
        ApiResponse.success(
            "Notification created successfully.",
            notificationService.create(request, document)
        )
    );
}
```

**Explanation for viva:**

- **HTTP Method:** POST (creates new resource)
- **Endpoint:** `/api/admin/notifications` (admin-only)
- **Content-Type:** `multipart/form-data` (for file upload)
- **Parameters:** Form parameters + file
- **Status Code:** 200 OK
- **Key Point:** File handling without JSON Content-Type

---

#### **PUT - Update User Profile**

```java
@PutMapping("/users/{userId}/profile")
public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
        @PathVariable Long userId,
        @RequestBody UpdateProfileRequest request) {

    return ResponseEntity.ok(
        ApiResponse.success(
            "Profile updated successfully.",
            userService.updateUserProfile(userId, request)
        )
    );
}
```

**Explanation for viva:**

- **HTTP Method:** PUT (idempotent update)
- **Endpoint:** `/api/users/{userId}/profile` (hierarchical)
- **PathVariable:** userId identifies resource
- **RequestBody:** Complete profile object in JSON
- **Status Code:** 200 OK
- **Why PUT, not PATCH?** Simpler - send entire object

---

#### **DELETE - Remove Notification**

```java
@DeleteMapping("/admin/notifications/{id}")
public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
    notificationService.delete(id);
    return ResponseEntity.ok(
        ApiResponse.success("Notification removed successfully.", null)
    );
}
```

**Explanation for viva:**

- **HTTP Method:** DELETE (removes resource, idempotent)
- **Endpoint:** `/api/admin/notifications/{id}`
- **Response Data:** null (no data after deletion)
- **Status Code:** 200 OK or 204 No Content

---

### 2. ERROR HANDLING

#### **ApiResponse Wrapper**

```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
```

**Explanation for viva:**

- **Generic Class:** `<T>` allows any data type
- **Consistent Format:** All responses have same structure
- **Success:** `success=true, data filled, message explains what happened`
- **Error:** `success=false, data=null, message explains error`

---

#### **Global Exception Handler**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(
            IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
            ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(
            DataIntegrityViolationException ex) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(
                "Submitted data is invalid or exceeds allowed limits."));
    }
}
```

**Explanation for viva:**

- **@RestControllerAdvice:** Catches exceptions globally
- **@ExceptionHandler:** Maps exceptions to handlers
- **Status Codes:** 400 (bad request), 404 (not found), etc.
- **Meaningful Messages:** Custom error messages instead of stack traces
- **Why?** Consistent error handling across entire API

---

### 3. DATABASE PERSISTENCE - ENTITIES

#### **User Entity**

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.STUDENT;

    @Column(nullable = false)
    private boolean blocked = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (role == null) {
            role = UserRole.STUDENT;
        }
    }
}
```

**Explanation for viva:**

- **@Entity:** Class maps to database table
- **@Table(name="users"):** Specifies table name
- **@Id:** Primary key
- **@GeneratedValue:** Auto-increment ID
- **@Column:** Database column properties
  - `nullable=false` → NOT NULL constraint
  - `unique=true` → UNIQUE constraint
  - `updatable=false` → Cannot be changed after creation
- **@Enumerated:** Stores enum as string
- **@PrePersist:** Hook - runs before save
- **Default Values:** role=STUDENT, blocked=false

---

#### **Notification Entity**

```java
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 1500)
    private String message;

    @Column(length = 500)
    private String linkUrl;

    @Lob
    private byte[] documentData;

    @Column(length = 120)
    private String documentContentType;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
```

**Explanation for viva:**

- **@Lob:** Large Object - stores binary file data (up to 4GB)
- **byte[]:** File content stored as bytes
- **documentContentType:** Stores MIME type (e.g., "application/pdf")
- **length=**: Varchar length (120 for title, 1500 for message)
- **Timestamps:** Track when notification created

---

### 4. ROLE MANAGEMENT

#### **UserRole Enum**

```java
public enum UserRole {
    STUDENT,
    ADMIN,
    STAFF,
    FACULTY
}
```

**Explanation for viva:**

- **Four roles:** Different access levels
- **STUDENT:** Default role, limited access
- **ADMIN:** Full access, can manage users/notifications
- **STAFF/FACULTY:** Other roles for campus staff
- **String storage:** Stored as VARCHAR in database

---

#### **Role-Based Endpoint Protection**

```java
@PostMapping("/admin/notifications")
public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(...) {
    // Only admins should call this endpoint
}

@GetMapping("/admin/dashboard")
public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
    // Admin-only endpoint
}
```

**Explanation for viva:**

- **Naming Convention:** `/api/admin/*` = admin-only
- **Current Implementation:** Naming-based (simple)
- **Production:** Should use `@PreAuthorize("hasRole('ADMIN')")`
- **Service Layer:** Check `user.getRole()` in service
- **Security:** Prevent non-admins from accessing

---

### 5. GOOGLE OAUTH IMPLEMENTATION

#### **OAuth Request DTO**

```java
public class GoogleAuthRequest {
    private String token;  // JWT from Google

    // Getters & setters
}
```

#### **OAuth Controller Endpoint**

```java
@PostMapping("/auth/google")
public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
        @RequestBody GoogleAuthRequest request) {
    AuthResponse response = userService.loginWithGoogle(request);
    return ResponseEntity.ok(
        ApiResponse.success("Google login successful.", response)
    );
}
```

#### **OAuth Service Implementation**

```java
private final GoogleIdTokenVerifier googleIdTokenVerifier;

private GoogleIdTokenVerifier buildGoogleVerifier(String clientId) {
    return new GoogleIdTokenVerifier.Builder(
        GoogleNetHttpTransport.newTrustedTransport(),
        GsonFactory.getDefaultInstance())
        .setAudience(Collections.singletonList(clientId))
        .build();
}

@Override
public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
    try {
        // 1. Verify JWT signature with Google's public key
        GoogleIdToken idToken = googleIdTokenVerifier.verify(request.getToken());

        if (idToken != null) {
            // 2. Extract email from verified token
            String email = idToken.getPayload().getEmail();

            // 3. Find or create user
            User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(idToken.getPayload().get("name").toString());
                    newUser.setRole(UserRole.STUDENT);
                    newUser.setBlocked(false);
                    return userRepository.save(newUser);
                });

            // 4. Return auth response
            return toAuthResponse(user);
        } else {
            throw new GeneralSecurityException("Invalid Google token");
        }
    } catch (Exception ex) {
        throw new IllegalArgumentException("Google login failed: " + ex.getMessage());
    }
}
```

**Explanation for viva:**

- **GoogleIdTokenVerifier:** Validates JWT signature using Google's public key
- **Flow:** Token received → Signature verified → Email extracted → User created/found
- **Security:** Cannot forge token (Google signed it)
- **Benefits:** No password stored, delegated to Google, one-click login
- **Error Handling:** Invalid tokens throw exception

---

### 6. PASSWORD SECURITY

#### **Password Hashing in Registration**

```java
@Override
public AuthResponse register(RegisterRequest request) {
    // Validation
    if (request.getPassword().length() < 6) {
        throw new IllegalArgumentException("Password must be at least 6 characters.");
    }

    User user = new User();
    user.setName(request.getName().trim());
    user.setEmail(request.getEmail().trim().toLowerCase());

    // Hash password with BCrypt
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    user.setRole(UserRole.STUDENT);

    User savedUser = userRepository.save(user);
    return toAuthResponse(savedUser);
}
```

**Explanation for viva:**

- **BCrypt:** Industry-standard password hashing
- **encode():** Hashes password with salt
- **Never returns plaintext:** No way to reverse hash
- **Validation:** Minimum 6 characters required
- **Normalization:** Email lowercase for consistency

---

#### **Password Verification in Login**

```java
@Override
public AuthResponse login(AuthRequest request) {
    User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
        .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

    // Verify password
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new IllegalArgumentException("Invalid email or password.");
    }

    // Update login stats
    user.setLoginCount(user.getLoginCount() + 1);
    user.setLastLoginAt(LocalDateTime.now());
    userRepository.save(user);

    return toAuthResponse(user);
}
```

**Explanation for viva:**

- **matches():** Compares plaintext input with stored hash
- **Constant Message:** Don't reveal if email or password wrong (security!)
- **Login Stats:** Track login count and last login time
- **Why separate?** Registration hashes, login verifies

---

### 7. PROFILE MANAGEMENT

#### **Update Profile Service**

```java
@Override
public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // Update editable fields
    if (request.getName() != null && !request.getName().isBlank()) {
        user.setName(request.getName().trim());
    }
    if (request.getProfileImageUrl() != null) {
        user.setProfileImageUrl(request.getProfileImageUrl());
    }
    if (request.getAddress() != null) {
        user.setAddress(request.getAddress());
    }
    if (request.getMobileNumber() != null) {
        user.setMobileNumber(request.getMobileNumber());
    }
    if (request.getDepartment() != null) {
        user.setDepartment(request.getDepartment());
    }
    if (request.getBio() != null) {
        user.setBio(request.getBio());
    }

    // Save changes
    User updatedUser = userRepository.save(user);
    return toUserProfileResponse(updatedUser);
}
```

**Explanation for viva:**

- **Null Checking:** Only update if field provided
- **Trimming:** Remove whitespace
- **Partial Updates:** Update only provided fields
- **Save:** JPA detects changes and updates DB
- **DTO Conversion:** Return as ProfileResponse (exclude sensitive fields)

---

#### **Change Password Service**

```java
@Override
public void changePassword(Long userId, ChangePasswordRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // Verify current password
    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
        throw new IllegalArgumentException("Current password is incorrect.");
    }

    // Validate new password
    if (request.getNewPassword().length() < 6) {
        throw new IllegalArgumentException("New password must be at least 6 characters.");
    }

    // Ensure passwords match
    if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
        throw new IllegalArgumentException("Passwords do not match.");
    }

    // Hash and update
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
}
```

**Explanation for viva:**

- **Verification:** Current password must be correct
- **Validation:** New password requirements
- **Confirmation:** Both new passwords must match
- **Security:** Old password never exposed
- **Hashing:** New password hashed before storage

---

### 8. FILE UPLOAD HANDLING

#### **Multipart Form Data Axios Config**

```javascript
api.interceptors.request.use((config) => {
  // For FormData, let browser set Content-Type with boundary
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
    return config;
  }

  // For regular JSON, set Content-Type
  config.headers = config.headers || {};
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});
```

**Explanation for viva:**

- **FormData:** Special handling for file uploads
- **Delete Content-Type:** Let browser set with boundary
- **Boundary:** Separator between form fields and file
- **JSON:** Regular applications/json for API calls
- **Why?** Generic Content-Type breaks multipart parsing

---

#### **File Upload in Controller**

```java
@PostMapping(value = "/admin/notifications",
             consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ApiResponse<NotificationResponse>> createNotificationWithFile(
        @RequestParam String title,
        @RequestParam String message,
        @RequestParam(required = false) MultipartFile document) {

    CreateNotificationRequest request = new CreateNotificationRequest();
    request.setTitle(title);
    request.setMessage(message);

    return ResponseEntity.ok(
        ApiResponse.success(
            "Notification created successfully.",
            notificationService.create(request, document)
        )
    );
}
```

**Explanation for viva:**

- **@RequestParam:** Extract form parameters
- **MultipartFile:** Spring abstraction for uploaded file
- **consumes=MULTIPART_FORM_DATA_VALUE:** Endpoint accepts multipart
- **required=false:** Document is optional
- **Service:** Handles file conversion to bytes

---

#### **File Processing in Service**

```java
@Override
public NotificationResponse create(CreateNotificationRequest request,
                                   MultipartFile file) {
    Notification notification = new Notification();
    notification.setTitle(request.getTitle());
    notification.setMessage(request.getMessage());
    notification.setLinkUrl(request.getLinkUrl());
    notification.setLinkLabel(request.getLinkLabel());
    notification.setCreatedBy(request.getCreatedBy());

    // Process file if provided
    if (file != null && !file.isEmpty()) {
        try {
            notification.setDocumentName(file.getOriginalFilename());
            notification.setDocumentContentType(file.getContentType());
            notification.setDocumentData(file.getBytes());  // Convert to byte[]
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to upload file: " + ex.getMessage());
        }
    }

    Notification saved = notificationRepository.save(notification);
    return toNotificationResponse(saved);
}
```

**Explanation for viva:**

- **getOriginalFilename():** Get file name from multipart
- **getContentType():** Get MIME type (pdf, image/png, etc.)
- **getBytes():** Read file as byte array
- **IOException:** Catch file reading errors
- **Storage:** Bytes stored in MySQL BLOB field

---

#### **File Download**

```java
@GetMapping("/notifications/{id}/document")
public ResponseEntity<ByteArrayResource> downloadDocument(@PathVariable Long id) {
    NotificationDocumentResponse document = notificationService.getDocument(id);
    ByteArrayResource resource = new ByteArrayResource(document.getData());

    // Determine content type
    MediaType mediaType;
    try {
        mediaType = MediaType.parseMediaType(document.getContentType());
    } catch (Exception ex) {
        mediaType = MediaType.parseMediaType(MimeTypeUtils.APPLICATION_OCTET_STREAM_VALUE);
    }

    return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + document.getFileName() + "\"")
            .body(resource);
}
```

**Explanation for viva:**

- **ByteArrayResource:** Wraps byte[] as downloadable resource
- **contentType():** Set MIME type (pdf, image, etc.)
- **CONTENT_DISPOSITION:** Tell browser to download/display
- **inline:** Display in browser if possible
- **attachment:** Force download
- **filename:** Original filename

---

### 9. REPOSITORY PATTERN

#### **UserRepository**

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u")
    long countTotalUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") UserRole role);
}
```

**Explanation for viva:**

- **JpaRepository:** Spring provides CRUD automatically (save, delete, findById)
- **Custom Query:** findByEmail, existsByEmail
- **@Query:** Custom JPQL queries
- **Why?** Abstract database operations, easier testing

---

### 10. DTO PATTERN

#### **Update Profile Request DTO**

```java
public class UpdateProfileRequest {
    private String name;
    private String profileImageUrl;
    private String address;
    private String mobileNumber;
    private String department;
    private String bio;

    // Getters & Setters
}
```

#### **User Profile Response DTO**

```java
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String profileImageUrl;
    private String address;
    private String mobileNumber;
    private String department;
    private String bio;
    private UserRole role;
    private LocalDateTime createdAt;

    // Getters & Setters
}
```

**Explanation for viva:**

- **Request DTO:** What client sends
- **Response DTO:** What API returns
- **Security:** Don't expose password, other sensitive fields
- **Transformation:** Convert Entity ↔ DTO

---

## 📝 HOW TO EXPLAIN CODE IN VIVA

**When asked to explain code:**

1. **Purpose (What):**
   - "This endpoint retrieves all notifications..."

2. **Implementation (How):**
   - "Uses HTTP GET method..."
   - "Calls service layer..."
   - "Returns ApiResponse wrapper..."

3. **Design (Why):**
   - "We use ApiResponse for consistency..."
   - "DTO pattern separates entity from response..."
   - "Repositories abstract database operations..."

4. **Security/Best Practices:**
   - "Password is hashed with BCrypt..."
   - "Email is unique constraint..."
   - "Admin endpoints prefixed with /admin..."

5. **Error Handling:**
   - "If user not found, throw ResourceNotFoundException..."
   - "GlobalExceptionHandler catches and returns 404..."
   - "Message is returned to client..."

---

Good luck explaining your code! You've built a solid application. 🚀
