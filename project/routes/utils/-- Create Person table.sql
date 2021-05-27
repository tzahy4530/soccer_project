
DROP TABLE dbo.Events
DROP TABLE dbo.Matches

-- Create Course table
CREATE TABLE Matches
(
    match_id INT IDENTITY PRIMARY KEY,
    date NVARCHAR(10) NOT NULL,
    hour NVARCHAR(5) NOT NULL,
    host_team INT NOT NULL,
    away_team INT NOT NULL,
    referee_id INT,
    stage_id INT NOT NULL,
    stadium NVARCHAR(60) NOT NULL,
    home_goal INT,
    away_goal INT,
)

CREATE TABLE Events
(
    match_id INT REFERENCES Matches(match_id),
    description NVARCHAR(120),
)

