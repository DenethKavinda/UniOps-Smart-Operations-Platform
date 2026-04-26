# Quick Viva Q&A Reference

## ⚡ RAPID FIRE QUESTIONS & ANSWERS

### **REST & HTTP Methods**

**Q: What are HTTP methods? Name them.**
A: Four main methods:

- **GET** - Retrieve data (safe, idempotent)
- **POST** - Create data (non-idempotent)
- **PUT** - Update data (idempotent, replaces entire resource)
- **DELETE** - Remove data (idempotent)

**Q: What's the difference between PUT and PATCH?**
A:

- **PUT** - Replace entire resource (I use this)
- **PATCH** - Update partial fields
  I chose PUT because I send complete objects from frontend.

**Q: What HTTP status codes did you use?**
A:

- 200 OK - Successful operations
- 201 Created - Resource created
- 400 Bad Request - Validation errors
- 403 Forbidden - No access
- 404 Not Found - Resource doesn't exist
- 500 Server Error - Unexpected error

**Q: What does 201 Created mean?**
A: Server created a new resource. Usually for POST requests. Example: User registration returns 201.

**Q: What does 204 No Content mean?**
A: Success but no body returned. Example: DELETE operation.

---

### **API Design & Naming**

**Q: How did you design your API endpoints?**
A: Followed REST naming conventions:

- Resource-based: `/api/notifications`, `/api/users`
- Hierarchical: `/api/users/{userId}/profile`
- Action-based for auth: `/api/auth/login`, `/api/auth/register`
- Admin-separated: `/api/admin/*`

**Q: Why use `/api/admin/notifications` instead of just `/api/notifications/admin`?**
A: To clearly indicate this is an admin-only endpoint. RESTful convention separates authorization/resource.

**Q: Should you include verbs in endpoints?**
A: Generally NO. Avoid `/api/createNotification` or `/api/deleteUser`. Instead use HTTP methods: POST, DELETE.

---

### **Error Handling**

**Q: How do you return error responses?**
A: Using ApiResponse wrapper:

```json
{
  "success": false,
  "message": "Email is already registered.",
  "data": null
}
```

**Q: Why use a wrapper class for responses?**
A: Consistency - all responses follow same structure (success, message, data). Easy for frontend to parse.

**Q: What exceptions do you handle?**
A:

- IllegalArgumentException - Validation errors
- IllegalStateException - Forbidden operations
- ResourceNotFoundException - Resource not found
- DataIntegrityViolationException - DB constraint violations
- MultipartException - File upload errors

**Q: How do you prevent exposing sensitive info in errors?**
A: Use generic messages for sensitive operations, log detailed errors server-side only.

---

### **Database & Persistence**

**Q: How does data persist in your app?**
A:

1. Data comes via REST API
2. Spring Controller → Service → Repository
3. JPA/Hibernate converts Java to SQL
4. MySQL database stores permanently
5. Next request retrieves from DB

**Q: What's JPA?**
A: Java Persistence API - ORM (Object-Relational Mapping) that maps Java classes to database tables automatically.

**Q: What's Hibernate?**
A: Implementation of JPA. Generates SQL, manages transactions, handles object-relational mapping.

**Q: Show me entity example.**
A:

```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;
}
```

**Q: What does @PrePersist do?**
A: Runs automatically before object saved to DB. I use it to set timestamp: `createdAt = LocalDateTime.now();`

**Q: How do you generate table schema?**
A: `spring.jpa.hibernate.ddl-auto=update` auto-creates/updates tables from entities.

**Q: What about foreign keys / relationships?**
A: Not used in my current design (simplified). If adding: `@ManyToOne`, `@OneToMany` annotations.

---

### **Role Management & Security**

**Q: How do you manage user roles?**
A:

```java
public enum UserRole {
    STUDENT, ADMIN, STAFF, FACULTY
}

@Enumerated(EnumType.STRING)
private UserRole role = UserRole.STUDENT;
```

**Q: How do you restrict admin endpoints?**
A: Naming convention `/api/admin/*` indicates admin access. In real production, use Spring Security `@PreAuthorize` or JWT claims.

**Q: What prevents a student from becoming admin?**
A:

1. Default role: STUDENT (not ADMIN)
2. Only admin API can change roles
3. Validate role values against enum
4. (Should add: Spring Security checks on endpoint)

**Q: How do you hash passwords?**
A: BCrypt hashing:

```java
passwordEncoder.encode(request.getPassword())  // Hash password
passwordEncoder.matches(input, stored)         // Verify password
```

**Q: Why BCrypt instead of MD5/SHA?**
A: BCrypt is:

- Salted (prevents rainbow table attacks)
- Slow (prevents brute force)
- Upgradeable (can increase difficulty)

---

### **OAuth & Authentication**

**Q: How does Google OAuth work?**
A:

1. User clicks "Login with Google"
2. Google OAuth dialog opens
3. User authenticates with Google
4. Frontend receives JWT token from Google
5. Frontend sends token to: `POST /api/auth/google`
6. Backend verifies token with Google's public key
7. Extract email from token
8. Create/fetch user in database
9. Return user info to frontend

**Q: Why is OAuth safer than password login?**
A:

- No passwords stored on your server
- Delegated to Google's secure auth
- Reduces phishing attacks
- User doesn't trust your password handling

**Q: How do you verify Google JWT?**
A:

```java
GoogleIdTokenVerifier verifier = buildGoogleVerifier(clientId);
GoogleIdToken idToken = verifier.verify(token);
String email = idToken.getPayload().getEmail();
```

**Q: What if Google JWT verification fails?**
A: Throw exception → caught by GlobalExceptionHandler → return 400 Bad Request

**Q: Do you store Google passwords?**
A: NO. Google users don't have password stored (null). They login via Google only.

---

### **Profile Management**

**Q: What fields can user update?**
A: name, bio, address, mobileNumber, department, profileImageUrl

**Q: How do you handle image uploads?**
A: Frontend reads file as Base64 string, sends in JSON. Backend stores as string in database.

**Q: Why Base64 instead of file upload?**
A: Simpler implementation. Tradeoff: larger JSON payload. Better approach: multipart file upload to separate storage (AWS S3).

**Q: How do you change password securely?**
A:

1. Verify current password with BCrypt
2. Validate new password (6+ chars)
3. Hash new password with BCrypt
4. Store in database

**Q: Can admin reset user password?**
A: Yes - `/api/auth/password-reset` endpoint (currently no verification, should add security questions/email verification)

---

### **Frontend Integration**

**Q: How does frontend communicate with backend?**
A: Axios HTTP client:

```javascript
const response = await api.put(`/users/${user.id}/profile`, {
  name: form.name,
  profileImageUrl: form.profileImageUrl,
  // ...
});
```

**Q: How do you handle multipart form data?**
A: Let browser set Content-Type header:

```javascript
if (config.data instanceof FormData) {
  delete config.headers["Content-Type"];
  return config;
}
```

**Q: What's the difference between form-data and JSON?**
A:

- **JSON** - For text/structured data (API calls)
- **form-data** - For file uploads (multipart)

---

### **Real-World Scenarios (Tricky Questions)**

**Q: What if two users try to update profile simultaneously?**
A: No issue! JPA handles locking. Last update wins (optimistic locking). In critical apps, use `@Version` for pessimistic locking.

**Q: What if database connection fails?**
A: Exception thrown → GlobalExceptionHandler catches → return 500 Server Error with generic message.

**Q: What if file upload is 1GB?**
A: Server returns error (configured `max-file-size`). Should reject at frontend first.

**Q: What if user sends invalid JSON?**
A: Spring validation kicks in → throws exception → returns 400 Bad Request.

**Q: What about SQL injection?**
A: Not vulnerable! JPA uses parameterized queries automatically (JPQL/HQL), not string concatenation.

**Q: What about XSS attacks?**
A: Frontend is protected by React (escapes HTML). API returns JSON (not HTML), so XSS unlikely.

**Q: What about CSRF attacks?**
A: Modern approach: stateless REST with CORS. Token-based auth (OAuth) is CSRF-safe.

---

### **Advanced/Follow-up Questions**

**Q: How would you add notification history?**
A: Add `isRead` boolean, timestamp fields, user relationship:

```java
@ManyToOne
private User user;

private boolean isRead = false;
```

**Q: How would you implement real-time notifications?**
A: Already done! Using Server-Sent Events (SSE):

```java
@GetMapping("/notifications/stream")
public SseEmitter streamNotifications() {
    return notificationService.subscribe();
}
```

**Q: How would you add email notifications?**
A: Use JavaMailSender (Spring Mail) to send emails asynchronously.

**Q: How would you scale this to 1 million users?**
A:

1. Database: Add indexes, read replicas
2. Caching: Redis for frequently accessed data
3. Async: Message queue for notifications
4. Microservices: Split into separate services
5. Load balancing: Distribute requests

---

## 📌 MUST MEMORIZE ANSWERS

### **"Tell me about your project in 2 minutes"**

"I built four key features for the UniOps campus management system:

**1. Notifications Module** - Admins create notifications with optional file attachments. System persists in MySQL, supports downloading documents, and provides real-time streaming via Server-Sent Events. API: POST (create), GET (list), DELETE (remove).

**2. Role Management** - Implemented four roles: STUDENT (default), ADMIN, STAFF, FACULTY. Endpoints allow role assignment, access control via `/api/admin/*` prefix, dashboard with role statistics.

**3. Google OAuth Integration** - Users can login with Google. Frontend gets JWT token from Google, sends to backend, backend verifies signature with Google's public key, creates user in database without storing password. Secure and convenient.

**4. Profile Management** - Users can update profile (name, bio, address, phone, department, photo), change passwords with current password verification, reset passwords. Image stored as Base64.

**Technical Highlights:**

- RESTful API with proper HTTP methods (GET, POST, PUT, DELETE)
- Consistent error responses with meaningful messages
- MySQL database with JPA/Hibernate ORM
- BCrypt password hashing
- Role-based access control
- Proper HTTP status codes (200, 201, 400, 403, 404, 500)

All features follow REST best practices and include proper error handling."

---

### **"Why should we give you high marks?"**

"My implementation demonstrates:

1. **Proper REST API design** - correct HTTP methods, naming conventions
2. **Data persistence** - MySQL with proper entity mapping
3. **Error handling** - meaningful messages, proper status codes
4. **Security** - BCrypt hashing, OAuth integration, role-based access
5. **Clean architecture** - separated controllers, services, repositories, DTOs
6. **Real OAuth implementation** - not just demo code
7. **File handling** - multipart form data for attachments
8. **Frontend integration** - Axios configuration, error handling
9. **User experience** - validation, meaningful feedback
10. **Scalability potential** - proper patterns for future growth"

---

## 🎯 ANSWERING TIPS

| Situation               | Do This                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| **Don't know answer**   | Say "I'm not sure, but I would..." (show thinking)                 |
| **Question about code** | Show in IDE, explain line by line                                  |
| **Asked to improve**    | Mention: caching, microservices, security, testing                 |
| **About HTTP status**   | Remember: 200 success, 400 bad input, 403 forbidden, 404 not found |
| **About database**      | Think: entity → repository → JPA → Hibernate → MySQL               |
| **Caught on mistake**   | Admit it honestly, explain how you'd fix it                        |

---

## ✅ CONFIDENCE CHECKLIST

Before viva, verify you can answer:

- [ ] What are HTTP methods and which did you use?
- [ ] Explain your API endpoint naming
- [ ] How do you handle errors?
- [ ] Show me one error handling code
- [ ] How does data persist in your app?
- [ ] Show me a JPA entity
- [ ] How do you manage user roles?
- [ ] Explain your OAuth implementation
- [ ] How do you hash passwords?
- [ ] What's your profile update flow?
- [ ] How would you prevent SQL injection?
- [ ] What status codes did you return?
- [ ] Draw your system architecture
- [ ] Explain your service layer
- [ ] Why use Spring Boot?

**If you can answer 70%+ confidently → You'll do great!** 🎓

---

Good luck! Remember: confidence + clear explanation = good marks! 🚀
