USE uni_ops;

CREATE TABLE IF NOT EXISTS assets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NULL,
    capacity INT NULL,
    location VARCHAR(255) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

ALTER TABLE assets ADD COLUMN IF NOT EXISTS type VARCHAR(100) NULL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS capacity INT NULL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS location VARCHAR(255) NULL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE assets SET status = 'ACTIVE' WHERE UPPER(status) = 'AVAILABLE';
UPDATE assets SET status = 'OUT_OF_SERVICE' WHERE UPPER(status) = 'UNAVAILABLE';
UPDATE assets SET status = 'ACTIVE' WHERE status IS NULL OR TRIM(status) = '';

CREATE TABLE IF NOT EXISTS asset_availability_windows (
    id BIGINT NOT NULL AUTO_INCREMENT,
    asset_id BIGINT NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_asset_availability_windows_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_asset_window_time CHECK (start_at < end_at)
);

CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_name ON assets(name);
CREATE INDEX idx_asset_windows_asset_id ON asset_availability_windows(asset_id);
CREATE INDEX idx_asset_windows_start_end ON asset_availability_windows(start_at, end_at);