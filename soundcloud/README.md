# SoundVault Pro Backend

SoundVault Pro is a privacy-focused music streaming platform that allows users to securely stream their personal music collection from multiple cloud services while maintaining complete privacy and control over their data.

## Features

- **Secure Authentication**: JWT-based authentication using Supabase
- **Cloud Storage Integration**: Support for multiple cloud storage providers (Google Drive, Dropbox, OneDrive)
- **Secure Share Links**: Create and manage expiring share links for music files
- **Privacy First**: No server-side processing of music data; backend acts only as a secure proxy
- **API Documentation**: Interactive OpenAPI/Swagger documentation

## Technology Stack

- Java 17
- Spring Boot 3.4.2
- Spring Security
- JWT Authentication
- OpenAPI/Swagger Documentation

## Getting Started

### Prerequisites

- Java 17
- Maven
- Supabase Account (for authentication)

### Configuration

1. Create a `.env` file in the project root and add your Supabase configuration:
```
JWT_SECRET=your-supabase-jwt-secret
JWT_ISSUER=supabase
```

2. Configure cloud storage providers (if needed) in `application.yml`:
```yaml
cloud:
  google:
    credentials: path-to-credentials.json
  dropbox:
    app-key: your-app-key
    app-secret: your-app-secret
```

### Building and Running

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The application will start on port 8080. You can access:
- API endpoints at `http://localhost:8080/api`
- Swagger UI at `http://localhost:8080/api/swagger-ui.html`
- API documentation at `http://localhost:8080/api/api-docs`

## API Documentation

The API is documented using OpenAPI/Swagger. Key endpoints include:

### Cloud Storage Operations

- `GET /api/cloud/files` - List files from cloud storage
- `GET /api/cloud/files/{fileId}` - Get file details
- `GET /api/cloud/files/{fileId}/download` - Get secure download URL
- `GET /api/cloud/files/search` - Search files

### Share Links Management

- `POST /api/share-links` - Create new share link
- `GET /api/share-links` - List user's share links
- `GET /api/share-links/{linkId}` - Get share link details
- `DELETE /api/share-links/{linkId}` - Revoke share link
- `GET /api/share-links/validate/{token}` - Validate share link token

## Security

- All endpoints (except Swagger UI and API docs) require authentication
- Authentication is handled via JWT tokens issued by Supabase
- Share links include configurable expiration and access controls
- No unencrypted music data is processed or stored on the server

## Testing

Run the test suite:
```bash
mvn test
```

Key test classes:
- `JwtAuthenticationFilterTest`: Tests JWT validation and authentication
- `ShareLinkServiceTest`: Tests share link creation, validation, and management
- Integration tests for cloud storage operations

## Architecture

- **Controller Layer**: REST endpoints and request/response handling
- **Service Layer**: Business logic and integration with cloud providers
- **Security Layer**: JWT validation and request authentication
- **Exception Handling**: Global exception handler for consistent error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
