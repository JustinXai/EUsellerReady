# Provider Intake Operations Guide

**Date:** May 27, 2026
**Purpose:** Document how to view and manage provider intake form submissions

---

## 1. Where Submissions Are Stored

All provider intake form submissions are stored in:

```
/opt/eureadyseller/data/messages.jsonl
```

This is a JSON Lines file (one JSON object per line). Each line is a complete submission record.

---

## 2. How to View Recent Submissions

### View last 20 submissions

```bash
sudo tail -n 20 /opt/eureadyseller/data/messages.jsonl
```

### View last 10 submissions

```bash
sudo tail -n 10 /opt/eureadyseller/data/messages.jsonl
```

### View all submissions (careful - file grows over time)

```bash
sudo cat /opt/eureadyseller/data/messages.jsonl
```

---

## 3. How to Search Submissions

### Search by email

```bash
sudo grep -i "user@example.com" /opt/eureadyseller/data/messages.jsonl
```

### View today's submissions

```bash
sudo grep "$(date -u +%Y-%m-%d)" /opt/eureadyseller/data/messages.jsonl
```

### View submissions from a specific date

```bash
sudo grep "2026-05-27" /opt/eureadyseller/data/messages.jsonl
```

### Search by platform

```bash
sudo grep '"platform":"shopify"' /opt/eureadyseller/data/messages.jsonl
```

### Search by topic

```bash
sudo grep '"gpsr"' /opt/eureadyseller/data/messages.jsonl
```

---

## 4. Saved Fields

Each submission contains these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID for the submission |
| `createdAt` | string | ISO timestamp when submitted |
| `email` | string | Contact email (required) |
| `name` | string/null | Optional contact name |
| `location` | string/null | Business location code |
| `platform` | string/null | Selling platform |
| `countries` | array | Target EU countries |
| `topics` | array | Compliance topics |
| `situation` | string/null | Current selling situation |
| `productCategory` | string/null | Product category description |
| `message` | string | Free-form message |
| `page` | string | Source page path |
| `referer` | string | Referer header |
| `userAgent` | string | Browser user agent |
| `ipHash` | string | SHA-256 hashed IP (not raw IP) |

### Example Submission

```json
{
  "id": "895a1548-bfd4-448a-bfe7-251a93a3c501",
  "createdAt": "2026-05-27T13:23:38.450Z",
  "email": "seller@example.com",
  "name": "Test User",
  "location": "us",
  "platform": "woocommerce",
  "countries": ["france", "germany"],
  "topics": ["gpsr", "epr-packaging"],
  "situation": "planning-eu-launch",
  "productCategory": "accessories",
  "message": "I am planning to sell accessories in France and Germany...",
  "page": "/request-eu-compliance-quotes/",
  "referer": "",
  "userAgent": "Mozilla/5.0...",
  "ipHash": "a1b2c3..."
}
```

---

## 5. Valid Field Values

### Location Values

- `us` - United States
- `uk` - United Kingdom
- `china` - China
- `canada` - Canada
- `other-non-eu` - Other non-EU country
- `eu` - EU country

### Platform Values

- `shopify` - Shopify
- `amazon` - Amazon
- `etsy` - Etsy
- `woocommerce` - WooCommerce
- `custom-store` - Custom / DTC store
- `multiple-platforms` - Multiple platforms
- `not-sure` - Not sure

### Country Values

- `germany` - Germany
- `france` - France
- `spain` - Spain
- `italy` - Italy
- `netherlands` - Netherlands
- `other` - Other / not sure

### Topic Values

- `gpsr` - GPSR product safety
- `eu-responsible-person` - EU Responsible Person
- `epr-packaging` - EPR packaging
- `weee` - WEEE / electronics
- `batteries` - Batteries
- `marketplace-warning` - Marketplace warning
- `not-sure` - Not sure

### Situation Values

- `planning-eu-launch` - Planning EU launch
- `already-selling-eu` - Already selling to EU
- `marketplace-warning` - Received marketplace request or warning
- `need-provider-quotes` - Need provider quotes
- `not-sure` - Not sure

---

## 6. Privacy Notes

**Important Security Points:**

1. **Raw IP is NOT stored** - Only a SHA-256 hash of the IP is saved
2. **No sensitive data should be submitted** - The form warns against submitting:
   - Passwords or API keys
   - Full supplier contracts
   - Highly confidential legal documents
   - Sensitive personal identification documents
3. **JSONL file should not be exposed publicly** - It must remain on the server only
4. **Do not ask users to submit sensitive documents** - A description of the situation is sufficient

---

## 7. Backup Reminders

### To backup messages

```bash
sudo cp /opt/eureadyseller/data/messages.jsonl /opt/eureadyseller/data/messages-backup-$(date +%Y%m%d).jsonl
```

### To list backups

```bash
ls -la /opt/eureadyseller/data/messages-backup-*.jsonl
```

**Important:**
- Never commit production messages.jsonl to git
- The `.gitignore` file excludes this file
- Store backups in a secure location

---

## 8. API Endpoint

The provider intake API runs as a systemd service:

```
eureadyseller-message-api.service
```

### Check service status

```bash
systemctl status eureadyseller-message-api
```

### View recent API logs

```bash
sudo journalctl -u eureadyseller-message-api -n 50
```

### Restart the service

```bash
sudo systemctl restart eureadyseller-message-api
```

---

## 9. Future Improvements

Potential enhancements for the provider intake system:

1. **Email notification** - Send notification when new submission received
2. **Simple admin dashboard** - Web interface for viewing submissions
3. **CRM export** - Export submissions to CSV or other format
4. **Provider matching tags** - Add tags for follow-up actions
5. **Analytics** - Track submission trends over time
6. **Spam protection review** - Monitor honeypot block rate

---

## 10. Troubleshooting

### API not responding

Check if service is running:
```bash
systemctl status eureadyseller-message-api
```

Restart if needed:
```bash
sudo systemctl restart eureadyseller-message-api
```

### Submissions not being saved

1. Check disk space:
   ```bash
   df -h /opt/eureadyseller
   ```

2. Check file permissions:
   ```bash
   ls -la /opt/eureadyseller/data/messages.jsonl
   ```

3. Check service logs:
   ```bash
   sudo journalctl -u eureadyseller-message-api -n 20
   ```

### Public submissions failing

Test from server:
```bash
curl -X POST http://127.0.0.1:8787/api/messages \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","message":"Test message from server"}'
```

Test from external:
```bash
curl -X POST https://eureadyseller.com/api/messages \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","message":"Test message from external"}'
```
