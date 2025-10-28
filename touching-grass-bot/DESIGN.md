# Touching Grass Bot - Design Document

## Overview
A Slack bot that tracks users who post photos tagged with `/grass` in a specific channel, maintaining a leaderboard of who's "touching grass" the most.

## Core Features

### 1. Photo Recognition & Scoring
- **Trigger**: User posts a photo with `/grass` tag in designated channel
- **Validation**: Bot verifies the message contains an image attachment
- **Scoring**: Award 1 point per valid "grass touching" photo
- **Response**: Confirmation message with updated score

### 2. Leaderboard System
- **Command**: `/leaderboard` displays current rankings
- **Format**: Shows top 10 users with points and rank
- **Updates**: Real-time scoring updates
- **History**: Track total photos posted per user

### 3. Channel Management
- **Flexible Deployment**: Bot works in any channel it's invited to
- **No Restrictions**: No manual channel restrictions - relies on Slack's invitation system
- **User Guidance**: Responds to bot mentions with usage instructions
- **Simple Setup**: Just invite the bot to your desired channel(s)

## Technical Architecture

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (Heroku Postgres)
- **Slack Integration**: Slack Bolt for JavaScript
- **Deployment**: Heroku
- **Environment**: Production-ready with proper logging

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  slack_user_id VARCHAR(50) UNIQUE NOT NULL,
  slack_username VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  total_points INTEGER DEFAULT 0,
  total_photos INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Photos Table
```sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  slack_message_ts VARCHAR(50) NOT NULL,
  slack_channel_id VARCHAR(50) NOT NULL,
  image_url TEXT,
  points_awarded INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### Slack Event Endpoints
- `POST /slack/events` - Handle Slack events (message posted)
- `POST /slack/interactive` - Handle interactive components
- `POST /slack/commands` - Handle slash commands

#### Internal API Endpoints
- `GET /api/leaderboard` - Get current leaderboard
- `GET /api/user/:userId` - Get user stats
- `POST /api/photo` - Record new photo submission

## Slack Integration Details

### Slash Commands
1. **`/grass`** - Tag a photo to submit for points
2. **`/leaderboard`** - Display current rankings

### Event Subscriptions
- `message.channels` - Listen for messages in designated channel
- `app_mention` - Handle bot mentions

### Bot Permissions Required
- `chat:write` - Send messages
- `channels:read` - Read channel information
- `files:read` - Access uploaded files
- `users:read` - Get user information

## Security Considerations

### Input Validation
- Verify message contains image attachment
- Validate user permissions in channel
- Sanitize all user inputs
- Rate limiting on photo submissions

### Data Protection
- Store minimal user data (Slack IDs only)
- No personal information beyond usernames
- Secure database connections
- Environment variable management

## Error Handling

### Common Scenarios
1. **No Image**: "Please attach a photo with your /grass tag!"
2. **Wrong Channel**: "This command only works in #erc-touching-grass channel"
3. **Database Error**: "Sorry, there was an issue recording your photo. Please try again."
4. **Rate Limiting**: "Please wait before submitting another photo"

### Logging Strategy
- Log all photo submissions
- Track error rates and patterns
- Monitor bot performance metrics
- Alert on critical failures

## Deployment Strategy

### Heroku Configuration
- **App Type**: Web dyno for Slack events
- **Database**: Heroku Postgres (Hobby tier)
- **Environment Variables**:
  - `SLACK_BOT_TOKEN`
  - `SLACK_SIGNING_SECRET`
  - `SLACK_APP_TOKEN`
  - `GRASS_CHANNEL_ID`
  - `DATABASE_URL`

### CI/CD Pipeline
- GitHub Actions for automated testing
- Heroku automatic deploys from main branch
- Database migrations on deploy
- Health check endpoints

## Performance Considerations

### Database Optimization
- Index on `slack_user_id` for fast user lookups
- Index on `created_at` for leaderboard queries
- Connection pooling for concurrent requests

### Caching Strategy
- Cache leaderboard data (5-minute TTL)
- Redis for session management (if needed)
- Static asset optimization

## Monitoring & Analytics

### Metrics to Track
- Photos submitted per day/week
- Active users count
- Bot response times
- Error rates by endpoint

### Health Checks
- Database connectivity
- Slack API connectivity
- Bot authentication status
- Memory and CPU usage

## Future Enhancements

### Phase 2 Features
- Photo validation (AI to detect grass/outdoor content)
- Weekly/monthly leaderboard resets
- Achievement badges
- Photo gallery view
- Team competitions

### Phase 3 Features
- Integration with other Slack workspaces
- Mobile app companion
- Social sharing features
- Advanced analytics dashboard

## Success Metrics

### Primary KPIs
- Daily active users submitting photos
- Total photos submitted
- User engagement retention rate
- Bot uptime percentage

### Secondary KPIs
- Average photos per user
- Peak usage times
- Channel activity increase
- User satisfaction (informal feedback)

## Risk Assessment

### Technical Risks
- **Slack API Changes**: Mitigation through version pinning and monitoring
- **Database Performance**: Mitigation through indexing and monitoring
- **Bot Rate Limits**: Mitigation through request queuing

## Implementation Timeline

### Week 1: Foundation
- Project setup and dependencies
- Basic Slack bot integration
- Database schema implementation
- Core photo submission logic

### Week 2: Core Features
- Leaderboard functionality
- Error handling and validation
- Basic testing suite
- Heroku deployment

### Week 3: Polish & Testing
- Comprehensive test coverage
- Performance optimization
- Documentation completion
- User acceptance testing

### Week 4: Launch & Monitoring
- Production deployment
- Monitoring setup
- User onboarding
- Feedback collection and iteration
