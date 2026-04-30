USE uni_ops;

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'LAB',
    capacity INT NOT NULL DEFAULT 30,
    location VARCHAR(255) NOT NULL,
    has_projector BOOLEAN NOT NULL DEFAULT true,
    has_camera BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_facility_type CHECK (type IN ('LAB', 'LECTURE_HALL', 'MEETING_ROOM'))
);

-- Create indexes for better query performance
CREATE INDEX idx_facilities_status ON facilities(status);
CREATE INDEX idx_facilities_type ON facilities(type);
CREATE INDEX idx_facilities_name ON facilities(name);
CREATE INDEX idx_facilities_location ON facilities(location);

-- Insert 30 sample facilities (10 of each type)
INSERT INTO facilities (name, type, capacity, location, has_projector, has_camera, status) VALUES
('Lab 1', 'LAB', 40, 'Block A', true, true, 'ACTIVE'),
('Lab 2', 'LAB', 40, 'Block B', true, true, 'ACTIVE'),
('Lab 3', 'LAB', 40, 'Block C', true, true, 'ACTIVE'),
('Lab 4', 'LAB', 40, 'Block D', true, true, 'ACTIVE'),
('Lab 5', 'LAB', 40, 'Block E', true, true, 'ACTIVE'),
('Lab 6', 'LAB', 40, 'Block A', true, true, 'ACTIVE'),
('Lab 7', 'LAB', 40, 'Block B', true, true, 'ACTIVE'),
('Lab 8', 'LAB', 40, 'Block C', true, true, 'ACTIVE'),
('Lab 9', 'LAB', 40, 'Block D', true, true, 'ACTIVE'),
('Lab 10', 'LAB', 40, 'Block E', true, true, 'ACTIVE'),

('Lecture Hall 1', 'LECTURE_HALL', 120, 'Block A', true, true, 'ACTIVE'),
('Lecture Hall 2', 'LECTURE_HALL', 120, 'Block B', true, true, 'ACTIVE'),
('Lecture Hall 3', 'LECTURE_HALL', 120, 'Block C', true, true, 'ACTIVE'),
('Lecture Hall 4', 'LECTURE_HALL', 120, 'Block D', true, true, 'ACTIVE'),
('Lecture Hall 5', 'LECTURE_HALL', 120, 'Block E', true, true, 'ACTIVE'),
('Lecture Hall 6', 'LECTURE_HALL', 120, 'Block A', true, true, 'ACTIVE'),
('Lecture Hall 7', 'LECTURE_HALL', 120, 'Block B', true, true, 'ACTIVE'),
('Lecture Hall 8', 'LECTURE_HALL', 120, 'Block C', true, true, 'ACTIVE'),
('Lecture Hall 9', 'LECTURE_HALL', 120, 'Block D', true, true, 'ACTIVE'),
('Lecture Hall 10', 'LECTURE_HALL', 120, 'Block E', true, true, 'ACTIVE'),

('Meeting Room 1', 'MEETING_ROOM', 16, 'Block A', true, true, 'ACTIVE'),
('Meeting Room 2', 'MEETING_ROOM', 16, 'Block B', true, true, 'ACTIVE'),
('Meeting Room 3', 'MEETING_ROOM', 16, 'Block C', true, true, 'ACTIVE'),
('Meeting Room 4', 'MEETING_ROOM', 16, 'Block D', true, true, 'ACTIVE'),
('Meeting Room 5', 'MEETING_ROOM', 16, 'Block E', true, true, 'ACTIVE'),
('Meeting Room 6', 'MEETING_ROOM', 16, 'Block A', true, true, 'ACTIVE'),
('Meeting Room 7', 'MEETING_ROOM', 16, 'Block B', true, true, 'ACTIVE'),
('Meeting Room 8', 'MEETING_ROOM', 16, 'Block C', true, true, 'ACTIVE'),
('Meeting Room 9', 'MEETING_ROOM', 16, 'Block D', true, true, 'ACTIVE'),
('Meeting Room 10', 'MEETING_ROOM', 16, 'Block E', true, true, 'ACTIVE');
