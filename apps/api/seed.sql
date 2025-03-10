-- Insert test users
INSERT INTO users (id, username, email) VALUES ('test-user-id', 'testuser', 'test@example.com');
-- Note: test-user-no-profile is not inserted, so it will trigger the no profile flow

-- Insert sports
INSERT INTO sports (id, name, description, abbreviation, external_id) VALUES (1, 'Football', 'American Football', 'NFL', 'NFL');

-- Insert teams
INSERT INTO teams (sport_id, name, abbreviation, external_id, api_metadata) VALUES (1, 'Philadelphia Eagles', 'PHI', 'PHI', '{"location":"Philadelphia, Pennsylvania","colors":{"primary":"#004C54","secondary":"#A5ACAF"},"conference":"NFC","division":"NFC East"}');
INSERT INTO teams (sport_id, name, abbreviation, external_id, api_metadata) VALUES (1, 'Kansas City Chiefs', 'KC', 'KC', '{"location":"Kansas City, Missouri","colors":{"primary":"#E31837","secondary":"#FFB612"},"conference":"AFC","division":"AFC West"}');

-- Insert the current campaign
INSERT INTO campaigns (name, description, start_date, end_date, status) VALUES ('The Big Game', 'Predict the winner of the big game', '2025-01-01', '2025-02-09', 'active');

-- Insert the big game
INSERT INTO games (campaign_id, sport_id, home_team_id, away_team_id, start_time, game_type, points_value, status, api_metadata) 
VALUES (1, 1, 1, 2, '2025-02-09 18:30:00', 'superbowl', 10, 'upcoming', '{"game_id": 1, "game_type": "superbowl"}');

-- Insert twitter quest
INSERT INTO quests (campaign_id, name, description, points_value, verification_type, verification_data, start_date, end_date) 
VALUES (1, 'Follow us', 'Follow @rngfanclub on X', 100, 'social_follow', 
  '{"platform": "twitter", "action": "follow", "intent_url": "https://twitter.com/intent/follow?screen_name=rngfanclub"}',
  '2025-01-01', '2025-02-09');

-- Insert prediction quest
INSERT INTO quests (campaign_id, name, description, points_value, verification_type, verification_data, start_date, end_date)
VALUES (1, 'Predict the winner', 'Who will win the big game?', 10, 'prediction', '{"game_id": 1, "game_link": "/games/1", "game_type": "superbowl"}', '2025-01-01', '2025-02-09');
