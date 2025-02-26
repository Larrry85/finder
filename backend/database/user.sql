-- Base Tables
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) DEFAULT '',
    password VARCHAR(255) NOT NULL,
    is_seed BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "profile" (
    id INTEGER PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    user_id INTEGER UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    first_name VARCHAR(50) DEFAULT '',
    last_name VARCHAR(50) DEFAULT '',
    birth_date DATE,
    gender VARCHAR(10),
    age INT,
    location_city VARCHAR(100),
    location_type TEXT,
    biography TEXT,
    interests TEXT[],
    max_distance_preference INT, 
    profile_picture VARCHAR(255),
    UNIQUE(user_id),
    is_seed BOOLEAN,
    new_messages INT DEFAULT 0,
    new_requests INT DEFAULT 0,
    new_recommendations INT DEFAULT 0,
    active_connections INT DEFAULT 0,
    match_rate DECIMAL(5, 2) DEFAULT 0.00,
    recent_matches TEXT[],
    recent_activity TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    security_question VARCHAR(255),
    golang_projects TEXT[] DEFAULT '{}',
    javascript_projects TEXT[] DEFAULT '{}',
    discord VARCHAR(50) DEFAULT '',
    my_projects VARCHAR(50) DEFAULT '',
    username VARCHAR(50) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "search_settings" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    interests TEXT[],
    location_type TEXT,
    max_distance_preference INT,
    golang_projects JSONB,
    javascript_projects JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS "chat_message" (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES "user" (id),
    receiver_id INTEGER REFERENCES "user"(id),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false,
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES "user" (id),
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES "user" (id)
);

CREATE TABLE IF NOT EXISTS "friend_request" (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS "friends" (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS "removed_profiles" (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS "activity" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    related_user_id INTEGER REFERENCES "user"(id),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON "profile"(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_request_sender_id ON "friend_request"(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_request_receiver_id ON "friend_request"(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_sender_id ON "chat_message"(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_receiver_id ON "chat_message"(receiver_id);

-- Functions
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_new_messages_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profile 
    SET new_messages = (
        SELECT COUNT(*) 
        FROM chat_message 
        WHERE receiver_id = NEW.receiver_id 
        AND is_read = false
    )
    WHERE user_id = NEW.receiver_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_friend_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Activity for the sender
    INSERT INTO activity (user_id, related_user_id, message, type)
    SELECT 
        NEW.sender_id,
        NEW.receiver_id,
        'Connected with ' || p.first_name || ' ' || p.last_name,
        'connection'
    FROM profile p
    WHERE p.user_id = NEW.receiver_id;

    -- Activity for the receiver
    INSERT INTO activity (user_id, related_user_id, message, type)
    SELECT 
        NEW.receiver_id,
        NEW.sender_id,
        'Connected with ' || p.first_name || ' ' || p.last_name,
        'connection'
    FROM profile p
    WHERE p.user_id = NEW.sender_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_friend_request_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        INSERT INTO activity (user_id, related_user_id, message, type)
        SELECT 
            NEW.receiver_id,
            NEW.sender_id,
            'New connection request from ' || p.first_name || ' ' || p.last_name,
            'request'
        FROM profile p
        WHERE p.user_id = NEW.sender_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_profile_update_activity()
RETURNS TRIGGER AS $$
DECLARE
    friend_id INTEGER;
BEGIN
    IF (OLD.interests IS DISTINCT FROM NEW.interests) OR 
       (OLD.golang_projects IS DISTINCT FROM NEW.golang_projects) OR 
       (OLD.javascript_projects IS DISTINCT FROM NEW.javascript_projects) THEN
        
        FOR friend_id IN (
            SELECT 
                CASE 
                    WHEN f.sender_id = NEW.user_id THEN f.receiver_id 
                    ELSE f.sender_id 
                END
            FROM friends f
            WHERE (f.sender_id = NEW.user_id OR f.receiver_id = NEW.user_id)
        ) LOOP
            INSERT INTO activity (user_id, related_user_id, message, type)
            VALUES (
                friend_id,
                NEW.user_id,
                NEW.first_name || ' ' || NEW.last_name || ' updated their profile',
                'profile_update'
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_message_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity (user_id, related_user_id, message, type)
    SELECT 
        NEW.receiver_id,
        NEW.sender_id,
        'New message from ' || p.first_name || ' ' || p.last_name,
        'message'
    FROM profile p
    WHERE p.user_id = NEW.sender_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop all existing triggers first
DROP TRIGGER IF EXISTS update_last_seen_trigger ON "user";
DROP TRIGGER IF EXISTS update_new_messages_count_trigger ON chat_message;
DROP TRIGGER IF EXISTS message_activity_trigger ON chat_message;
DROP TRIGGER IF EXISTS friend_activity_trigger ON friends;
DROP TRIGGER IF EXISTS friend_request_activity_trigger ON friend_request;
DROP TRIGGER IF EXISTS profile_update_activity_trigger ON profile;

-- Create all triggers
CREATE TRIGGER update_last_seen_trigger
    BEFORE UPDATE OF is_online ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();

CREATE TRIGGER update_new_messages_count_trigger
    AFTER INSERT OR UPDATE OF is_read ON chat_message
    FOR EACH ROW
    EXECUTE FUNCTION update_new_messages_count();

CREATE TRIGGER message_activity_trigger
    AFTER INSERT ON chat_message
    FOR EACH ROW
    EXECUTE FUNCTION create_message_activity();

CREATE TRIGGER friend_activity_trigger
    AFTER INSERT ON friends
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_activity();

CREATE TRIGGER friend_request_activity_trigger
    AFTER INSERT ON friend_request
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_activity();

CREATE TRIGGER profile_update_activity_trigger
    AFTER UPDATE ON profile
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_update_activity();