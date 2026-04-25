# Backend Cookie Consent Spec (UK GDPR / PECR)

This document is the implementation handoff for backend consent management to support UK GDPR + PECR cookie/storage compliance.

Frontend is already implemented with consent categories and local persistence. Backend work below will make consent auditable, user-linked, and legally defensible.

---

## 1) Scope and Goals

### Goals
- Store consent choices in backend for authenticated and anonymous users.
- Maintain an append-only consent event history.
- Return canonical latest consent state to frontend.
- Support consent updates and consent withdrawal.
- Support anonymous-to-authenticated identity merge.

### Frontend categories (already live)
- `necessary` (always true)
- `preferences`
- `analytics`
- `marketing`

### Frontend current keys
- localStorage: `fv_cookie_consent`
- cookie: `fv_cookie_consent`
- cookie: `fv_consent_updated_at`
- consent version currently sent by FE: `2026-04`

### Frontend event types
- `accept_all`
- `reject_non_essential`
- `save_preferences`
- `withdraw`

---

## 2) Required Backend Endpoints

Base path: `/api/v1/privacy`

1. `POST /consent`
   - Upsert latest consent state
   - Append event log entry

2. `GET /consent`
   - Return latest consent for authenticated user or anonymous visitor

3. `POST /consent/withdraw`
   - Force all non-essential categories to `false`
   - Keep `necessary = true`
   - Append withdraw event

---

## 3) Request/Response Contracts

## `POST /api/v1/privacy/consent`

### Request body
```json
{
  "consentVersion": "2026-04",
  "region": "UK",
  "source": "web",
  "eventType": "save_preferences",
  "anonymousId": "8f535c69-3f6b-4125-8c4e-3f514bb3551a",
  "preferences": {
    "necessary": true,
    "preferences": false,
    "analytics": true,
    "marketing": false
  }
}
```

### Server-side validation/enforcement
- `preferences.necessary` MUST be forced to `true` server-side.
- Reject invalid/missing booleans.
- Reject unknown event types.
- Identity must be resolved by either:
  - authenticated `userId`, or
  - `anonymousId` in body.

### Response
```json
{
  "consentId": "d0290eb2-357f-4af0-9682-d9f9dd5a66bb",
  "userId": null,
  "anonymousId": "8f535c69-3f6b-4125-8c4e-3f514bb3551a",
  "region": "UK",
  "consentVersion": "2026-04",
  "source": "web",
  "preferences": {
    "necessary": true,
    "preferences": false,
    "analytics": true,
    "marketing": false
  },
  "updatedAt": "2026-04-25T07:00:00.000Z",
  "createdAt": "2026-04-25T07:00:00.000Z"
}
```

## `GET /api/v1/privacy/consent`

### Query params
- `anonymousId` (optional if authenticated)

### Behavior
- If JWT present: fetch latest for `userId`.
- Else fetch latest for `anonymousId`.
- Return 404 if no consent exists.

## `POST /api/v1/privacy/consent/withdraw`

### Request body (optional)
```json
{
  "consentVersion": "2026-04",
  "region": "UK",
  "source": "web",
  "anonymousId": "8f535c69-3f6b-4125-8c4e-3f514bb3551a"
}
```

### Behavior
- Set:
  - `necessary = true`
  - `preferences = false`
  - `analytics = false`
  - `marketing = false`
- Record event type as `withdraw`.
- Return canonical latest consent object.

---

## 4) Data Model (Recommended)

Use two tables:

1) **Current state table** (`cookie_consents`)  
2) **Audit table** (`cookie_consent_events`) append-only

### `cookie_consents` columns
- `id` UUID PK
- `user_id` UUID NULL
- `anonymous_id` UUID NULL
- `region` VARCHAR NULL (example `UK`)
- `consent_version` VARCHAR NOT NULL
- `necessary` BOOLEAN NOT NULL DEFAULT TRUE
- `preferences` BOOLEAN NOT NULL
- `analytics` BOOLEAN NOT NULL
- `marketing` BOOLEAN NOT NULL
- `source` VARCHAR NOT NULL DEFAULT `web`
- `ip_hash` VARCHAR NULL
- `user_agent` VARCHAR(512) NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### `cookie_consent_events` columns
- `id` UUID PK
- `consent_id` UUID NULL (FK to `cookie_consents.id`)
- `user_id` UUID NULL
- `anonymous_id` UUID NULL
- `event_type` VARCHAR NOT NULL
- `consent_version` VARCHAR NOT NULL
- `necessary` BOOLEAN NOT NULL
- `preferences` BOOLEAN NOT NULL
- `analytics` BOOLEAN NOT NULL
- `marketing` BOOLEAN NOT NULL
- `region` VARCHAR NULL
- `source` VARCHAR NOT NULL DEFAULT `web`
- `ip_hash` VARCHAR NULL
- `user_agent` VARCHAR(512) NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### Indexes
- `cookie_consents(user_id, updated_at desc)`
- `cookie_consents(anonymous_id, updated_at desc)`
- `cookie_consent_events(user_id, created_at desc)`
- `cookie_consent_events(anonymous_id, created_at desc)`

### Integrity constraints
- Check constraint: `necessary = true`
- Check constraint: `event_type IN ('accept_all','reject_non_essential','save_preferences','withdraw')`
- Ensure at least one identity reference:
  - `user_id IS NOT NULL OR anonymous_id IS NOT NULL`

---

## 5) Identity and Merge Rules

When anonymous visitor logs in:

1. If anonymous consent exists and user consent does not:
   - copy latest anonymous consent as current user consent
   - keep original anonymous event trail

2. If both exist:
   - use latest `updated_at` as canonical current value
   - append merge event or metadata note in audit

3. Never delete history; only append events.

---

## 6) Processing Rules

- **Idempotency**: repeated identical payloads should not create noisy duplicate events unless event type differs.
- **Security**:
  - Rate limit write endpoints.
  - Validate JSON schema strictly.
  - Sanitize/truncate user-agent before storage.
- **Privacy minimization**:
  - Prefer `ip_hash` over raw IP.
  - Apply retention period for audit logs per policy/legal advice.

---

## 7) OpenAPI 3.0.3 Spec

```yaml
openapi: 3.0.3
info:
  title: Femved Privacy Consent API
  version: 1.0.0
  description: API for storing and retrieving user cookie/storage consent preferences for UK GDPR/PECR compliance.

servers:
  - url: https://api.femved.com/api/v1

tags:
  - name: PrivacyConsent
    description: Cookie and storage consent management

paths:
  /privacy/consent:
    post:
      tags: [PrivacyConsent]
      summary: Create or update current consent state
      description: |
        Upserts latest consent for authenticated user or anonymous visitor.
        Also logs an immutable consent event for audit purposes.
      security:
        - bearerAuth: []
        - {}
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConsentUpsertRequest'
            examples:
              savePreferences:
                value:
                  consentVersion: "2026-04"
                  region: "UK"
                  source: "web"
                  eventType: "save_preferences"
                  anonymousId: "8f535c69-3f6b-4125-8c4e-3f514bb3551a"
                  preferences:
                    necessary: true
                    preferences: false
                    analytics: true
                    marketing: false
      responses:
        '200':
          description: Consent stored successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConsentResponse'
        '400':
          description: Invalid request payload
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized (for auth-required mode)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Too many requests
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    get:
      tags: [PrivacyConsent]
      summary: Get latest consent state
      description: Returns latest stored consent for authenticated user or anonymous visitor.
      security:
        - bearerAuth: []
        - {}
      parameters:
        - in: query
          name: anonymousId
          required: false
          schema:
            type: string
            format: uuid
          description: Required for unauthenticated visitors if no auth token is sent.
      responses:
        '200':
          description: Latest consent found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConsentResponse'
        '404':
          description: No consent record exists yet
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '400':
          description: Missing identifier (neither auth user nor anonymousId)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /privacy/consent/withdraw:
    post:
      tags: [PrivacyConsent]
      summary: Withdraw non-essential consent
      description: |
        Sets all non-essential categories to false and logs a withdraw event.
        necessary remains true.
      security:
        - bearerAuth: []
        - {}
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConsentWithdrawRequest'
            examples:
              withdrawAnonymous:
                value:
                  consentVersion: "2026-04"
                  region: "UK"
                  source: "web"
                  anonymousId: "8f535c69-3f6b-4125-8c4e-3f514bb3551a"
      responses:
        '200':
          description: Consent withdrawn
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConsentResponse'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: No prior consent found for identity
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ConsentPreferences:
      type: object
      required: [necessary, preferences, analytics, marketing]
      properties:
        necessary:
          type: boolean
          description: Must always be true (server should enforce true)
          example: true
        preferences:
          type: boolean
          example: false
        analytics:
          type: boolean
          example: true
        marketing:
          type: boolean
          example: false

    ConsentUpsertRequest:
      type: object
      required: [consentVersion, preferences, eventType]
      properties:
        consentVersion:
          type: string
          example: "2026-04"
        region:
          type: string
          nullable: true
          example: "UK"
        source:
          type: string
          default: "web"
          example: "web"
        eventType:
          type: string
          enum: [accept_all, reject_non_essential, save_preferences, withdraw]
          example: save_preferences
        anonymousId:
          type: string
          format: uuid
          nullable: true
        preferences:
          $ref: '#/components/schemas/ConsentPreferences'

    ConsentWithdrawRequest:
      type: object
      properties:
        consentVersion:
          type: string
          example: "2026-04"
        region:
          type: string
          nullable: true
          example: "UK"
        source:
          type: string
          default: "web"
          example: "web"
        anonymousId:
          type: string
          format: uuid
          nullable: true

    ConsentResponse:
      type: object
      required:
        - consentId
        - consentVersion
        - source
        - preferences
        - updatedAt
      properties:
        consentId:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
          nullable: true
        anonymousId:
          type: string
          format: uuid
          nullable: true
        region:
          type: string
          nullable: true
          example: "UK"
        consentVersion:
          type: string
          example: "2026-04"
        source:
          type: string
          example: "web"
        preferences:
          $ref: '#/components/schemas/ConsentPreferences'
        updatedAt:
          type: string
          format: date-time
        createdAt:
          type: string
          format: date-time

    ErrorResponse:
      type: object
      required: [message]
      properties:
        message:
          type: string
          example: "Invalid consent payload"
        code:
          type: string
          nullable: true
          example: "CONSENT_VALIDATION_FAILED"
```

---

## 8) Suggested Implementation Order

1. Add DB migrations for `cookie_consents` and `cookie_consent_events`.
2. Add request DTOs/schemas and validators.
3. Implement `POST /privacy/consent` (upsert + event append).
4. Implement `GET /privacy/consent`.
5. Implement `POST /privacy/consent/withdraw`.
6. Implement anonymous/auth merge in login flow.
7. Add unit + integration tests.
8. Add observability: counters + error monitoring.

---

## 9) Acceptance Checklist

- [ ] API contracts match this doc exactly.
- [ ] `necessary` is always true server-side.
- [ ] Supports anonymous and authenticated identities.
- [ ] Consent updates are persisted and retrievable.
- [ ] Withdraw endpoint sets all non-essential to false.
- [ ] Event history is append-only and queryable.
- [ ] Login merge does not lose historical events.
- [ ] Tests cover create/update/reject/withdraw/merge.
- [ ] Rate limiting + validation in place.
- [ ] PII minimization in place (IP hash, UA truncation, retention policy).

---

## 10) Frontend Integration Notes

Frontend is already prepared to call these endpoints.  
Once backend is deployed, frontend can send consent updates immediately on:
- accept all
- reject non-essential
- save preferences
- withdraw

No frontend category renaming should be done without coordinated backend changes.
