# VideoApp

A real-time video chat application built with Django, Vue.js,WebSockets, WebRTC .

## Features
- Landing page
- User registeration and signup
- User authentication with JWT
- Real-time text chat uisng sockets
- Video conferencing using webrtc
- User presence indicators
- Responsive design

## Tech Stack

### Backend
- Django 5.2
- Django Channels for WebSockets
- Django REST Framework
- Redis for WebSocket channel layers
- JWT authentication with SimpleJWT

### Frontend
- Vue 3 with Options API
- Vite
- Axios for API requests
- WebSockets for real-time communication
- WebRTC for peer-to-peer video conferencing

## Getting Started

### Prerequisites
- Docker and Docker Compose

### Environment Setup

1. Create `.env` files for both frontend :

   ```
   **Frontend `.env` file** (place in `/frontend` directory):
   ```
    BASE_URL=http://localhost:5173
    VITE_API_URL=http://localhost:8000/api
    VITE_WS_URL=ws://localhost:8000
    VITE_USE_MOCK_STREAM=true
   ```

2. Clone the repository:
   ```
   git clone https://github.com/abdullahkiani007/video_app.git
   cd video_app
   ```

3. Start the application with Docker Compose:
   ```
   docker compose up -d --build
   ```

4. Access the application at http://localhost:5173

### Sample Login Credentials

The application doesn't come with seeded users. You'll need to register a new account through the UI.

## Development

### Project Structure
- `/frontend` - Vue.js frontend application
- `/backend` - Django backend application
  - `/chat` - Chat functionality
  - `/users` - User authentication and management

### Environment Variables

- environment variables can be found in the `env.sample` file in the frontend.

## Deployment Notes

- The application uses Docker for containerization, making it easy to deploy to any environment that supports Docker.
- Redis is used for WebSocket communication, which can be scaled horizontally.
- For production, consider:
  - Using a proper database (PostgreSQL/MySQL) instead of SQLite
  - Setting up proper SSL/TLS
  - Configuring a production-ready web server like Nginx

## Scaling Considerations

### Horizontal Scaling
- **Backend Services**: The Django application can be scaled horizontally behind a load balancer
- **WebSocket Connections**: Redis pub/sub allows for distributing WebSocket connections across multiple server instances
- **Database**: We can consider implementing read replicas and connection pooling for database scaling
- **Media Server**: For large deployments, consider implementing a TURN server cluster to handle WebRTC fallback scenarios

### Performance Optimization
- Implement caching strategies using Redis for frequently accessed data
- Consider using a CDN for static assets
- Optimize database queries with proper indexing
- Implement rate limiting to prevent abuse
- Use connection pooling for database connections

### Monitoring and Resilience
- Set up health checks for all services
- Implement circuit breakers for external service dependencies
- Use container orchestration (Kubernetes) for automatic scaling and self-healing
- Set up monitoring and alerting for system metrics (CPU, memory, network)
- Implement logging aggregation for troubleshooting

### Regional Deployment
- Consider multi-region deployment to reduce latency for global users
- Implement geo-routing to direct users to the closest server
- Use a distributed database solution for multi-region data consistency

## Challenges and Solutions

- **WebSocket Connectivity**: Ensured proper network configuration in Docker to allow WebSocket communication between services.
- **Cross-Origin Resource Sharing**: Configured CORS to allow frontend-backend communication.
- **Video Stream Handling**: Implemented fallback mechanisms for browsers that don't support camera access.
