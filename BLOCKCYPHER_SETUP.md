# BlockCypher API Key Setup Guide

## 🚨 Rate Limiting Issue Resolution

The application is currently experiencing rate limiting issues with the BlockCypher API. Getting a free API key will resolve this immediately.

## 📋 Quick Setup Steps

### 1. Register for Free API Key (2 minutes)

1. **Visit**: https://accounts.blockcypher.com/register
2. **Create Account**: 
   - Enter your email address
   - Create a password
   - Verify your email address
3. **Get Token**:
   - Log into your dashboard
   - Navigate to the "API Tokens" section
   - Copy your token (32-character hex string)

### 2. Add Token to Environment (1 minute)

Create a `.env.local` file in the project root:

```bash
# .env.local
BLOCKCYPHER_TOKEN=your_32_character_token_here
```

**Alternative**: Set as environment variable:

```bash
# Windows
set BLOCKCYPHER_TOKEN=your_token_here

# macOS/Linux
export BLOCKCYPHER_TOKEN=your_token_here
```

### 3. Restart Development Server

```bash
npm run dev
```

## 📊 Rate Limit Improvements

| Metric | Without Token | With Free Token | Improvement |
|--------|---------------|-----------------|-------------|
| Requests/second | 3 | 500 | **167x faster** |
| Requests/hour | 100 | 500,000 | **5,000x more** |
| WebHooks/hour | 100 | 30,000 | **300x more** |

## ✅ Verification

After setup, you should see this message in the console:

```
✅ BlockCypher API token found. Using enhanced limits (500 req/sec, 500k req/hour)
```

Instead of:

```
⚠️ No BlockCypher API token found. Using free tier limits (3 req/sec, 100 req/hour)
```

## 🔧 Advanced Error Handling

The application now includes:

- **Exponential Backoff**: Automatic retry with increasing delays
- **Circuit Breaker**: Temporary halt on repeated failures
- **Rate Limit Headers**: Respects `X-Ratelimit-Remaining` and `Retry-After`
- **Smart Logging**: Clear feedback on rate limit status

## 🆘 Troubleshooting

**Token not working?**
- Ensure `.env.local` is in the project root (same level as `package.json`)
- Restart the development server after adding the token
- Check the console for confirmation message

**Still getting rate limited?**
- The circuit breaker may be active - wait 1 minute and try again
- Check your token usage in the BlockCypher dashboard

## 📚 Additional Resources

- [BlockCypher Documentation](https://www.blockcypher.com/dev/bitcoin/)
- [Rate Limits Details](https://www.blockcypher.com/dev/bitcoin/#rate-limits-and-tokens)
- [Getting Started Guide](https://www.blockcypher.com/getting-started.html) 