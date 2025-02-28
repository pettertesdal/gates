CREATE DATABASE TestDB;

USE TestDB;

CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100),
    Email NVARCHAR(100)
);

INSERT INTO Users (Name, Email) VALUES ('John Doe', 'john@example.com');
INSERT INTO Users (Name, Email) VALUES ('Jane Smith', 'jane@example.com');

