# Chore Champ Admin API

## Overview

Admin API endpoints for managing family members, chores, rewards, and point requests.

## Base URL

```
https://your-app-url.com/api
```

## Authentication

All admin endpoints require a valid JWT token with `role: parent` in the claims.

Include the token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### Family Members

#### List Family Members

```
GET /admin/family
```

**Response:**

```json
{
  "members": [
    {
      "id": "uuid",
      "name": "Child Name",
      "email": "child@example.com",
      "role": "child",
      "avatarId": "boy-robot",
      "points": 100,
      "lastActiveAt": 1234567890,
      "createdAt": 1234567890
    }
  ]
}
```

#### Add Family Member

```
POST /admin/family
```

**Request Body:**

```json
{
  "name": "New Child",
  "role": "child",
  "avatarId": "boy-robot"
}
```

**Response:**

```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "name": "New Child",
    "role": "child",
    "avatarId": "boy-robot",
    "points": 0
  }
}
```

#### Delete Family Member

```
DELETE /admin/family/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

### Chores

#### List Chores

```
GET /admin/chores
```

**Query Parameters:**

- `status` - Filter by status (INCOMPLETE, PENDING_APPROVAL, COMPLETED)
- `assignedTo` - Filter by assigned user ID

**Response:**

```json
{
  "chores": [
    {
      "id": "uuid",
      "name": "Clean Room",
      "description": "Keep your room tidy",
      "points": 50,
      "status": "INCOMPLETE",
      "requiresApproval": true,
      "recurrence": "DAILY",
      "assignedTo": "uuid",
      "assignedByName": "Alex",
      "streak": 5,
      "lastCompletedDate": "2024-10-09T12:00:00Z",
      "createdAt": 1234567890
    }
  ]
}
```

#### Update Chore

```
PUT /admin/chores/:id
```

**Request Body:**

```json
{
  "name": "Updated Chore Name",
  "description": "Updated description",
  "points": 75,
  "assignedTo": "uuid",
  "requiresApproval": true,
  "recurrence": "WEEKLY"
}
```

**Response:**

```json
{
  "success": true,
  "chore": {
    "id": "uuid",
    "name": "Updated Chore Name",
    "points": 75
  }
}
```

### Rewards

#### List Rewards

```
GET /admin/rewards
```

**Response:**

```json
{
  "rewards": [
    {
      "id": "uuid",
      "name": "Extra Screen Time",
      "description": "1 hour of extra screen time",
      "points": 100,
      "category": "entertainment",
      "quantityLimit": null,
      "cooldownDays": null,
      "createdAt": 1234567890
    }
  ]
}
```

#### Create Reward

```
POST /admin/rewards
```

**Request Body:**

```json
{
  "name": "New Reward",
  "description": "Reward description",
  "points": 75,
  "category": "food"
}
```

**Response:**

```json
{
  "success": true,
  "reward": {
    "id": "uuid",
    "name": "New Reward",
    "points": 75
  }
}
```

### Point Requests

#### List Point Requests

```
GET /admin/requests
```

**Query Parameters:**

- `status` - Filter by status (PENDING, APPROVED, DENIED)

**Response:**

```json
{
  "requests": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Alex",
      "description": "Cleaned the garage",
      "pointsRequested": 50,
      "status": "PENDING",
      "approvedBy": null,
      "approvedByName": null,
      "approvedAt": null,
      "notes": null,
      "createdAt": 1234567890
    }
  ]
}
```

#### Approve Point Request

```
POST /admin/requests/:id/approve
```

**Request Body:**

```json
{
  "notes": "Great job cleaning the garage!"
}
```

**Response:**

```json
{
  "success": true,
  "request": {
    "id": "uuid",
    "status": "APPROVED",
    "approvedBy": "parent-uuid",
    "approvedAt": 1234567890,
    "notes": "Great job cleaning the garage!"
  }
}
```

#### Deny Point Request

```
POST /admin/requests/:id/deny
```

**Request Body:**

```json
{
  "notes": "Please complete your assigned chores first."
}
```

**Response:**

```json
{
  "success": true,
  "request": {
    "id": "uuid",
    "status": "DENIED",
    "approvedBy": "parent-uuid",
    "approvedAt": 1234567890,
    "notes": "Please complete your assigned chores first."
  }
}
```

### Statistics

#### Get Dashboard Stats

```
GET /admin/stats
```

**Response:**

```json
{
  "totalUsers": 5,
  "totalChores": 20,
  "totalRewards": 10,
  "pendingRequests": 3,
  "completedChores": 15,
  "thisWeekChores": 8,
  "thisWeekPointsEarned": 450
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

### 422 Unprocessable Entity

```json
{
  "error": "Validation Error",
  "message": "The request contains invalid data",
  "details": [
    {
      "field": "points",
      "message": "Must be a positive number"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- Rate limit: 100 requests per minute
- Header: `X-RateLimit-Limit: 100`
- Header: `X-RateLimit-Remaining: 95`
- Header: `X-RateLimit-Reset: 1234567890`

## Security

- All requests must be authenticated
- JWT tokens expire after 24 hours
- Passwords are hashed and stored securely
- Row-level security ensures data isolation between families
