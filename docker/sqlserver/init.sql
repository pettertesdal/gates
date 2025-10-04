IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'gates')
BEGIN
    CREATE DATABASE [gates];
END;
GO

USE [gates];
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'db_owner')
BEGIN
    EXEC('CREATE SCHEMA db_owner AUTHORIZATION dbo;');
END;
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'gates_user')
BEGIN
    CREATE LOGIN [gates_user] WITH PASSWORD = 'GatesUser!Pass123';
END;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'gates_user')
BEGIN
    CREATE USER [gates_user] FOR LOGIN [gates_user];
END;
GO

DECLARE @RoleMember INT;
SELECT @RoleMember = COUNT(*)
FROM sys.database_role_members rm
JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
JOIN sys.database_principals u ON rm.member_principal_id = u.principal_id
WHERE r.name = N'db_owner' AND u.name = N'gates_user';

IF (@RoleMember = 0)
BEGIN
    EXEC sp_addrolemember N'db_owner', N'gates_user';
END;
GO

IF OBJECT_ID(N'db_owner.user_roles', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.user_roles (
        id INT IDENTITY(1,1) PRIMARY KEY,
        role NVARCHAR(100) NOT NULL UNIQUE
    );
END;
GO

SET IDENTITY_INSERT db_owner.user_roles ON;

IF EXISTS (SELECT 1 FROM db_owner.user_roles WHERE id = 1)
BEGIN
    UPDATE db_owner.user_roles SET role = N'User' WHERE id = 1;
END
ELSE
BEGIN
    INSERT INTO db_owner.user_roles (id, role)
    VALUES (1, N'User');
END;

IF EXISTS (SELECT 1 FROM db_owner.user_roles WHERE id = 2)
BEGIN
    UPDATE db_owner.user_roles SET role = N'Admin' WHERE id = 2;
END
ELSE
BEGIN
    INSERT INTO db_owner.user_roles (id, role)
    VALUES (2, N'Admin');
END;

IF EXISTS (SELECT 1 FROM db_owner.user_roles WHERE id = 3)
BEGIN
    UPDATE db_owner.user_roles SET role = N'Super Admin' WHERE id = 3;
END
ELSE
BEGIN
    INSERT INTO db_owner.user_roles (id, role)
    VALUES (3, N'Super Admin');
END;

SET IDENTITY_INSERT db_owner.user_roles OFF;
GO

IF OBJECT_ID(N'db_owner.user_teams', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.user_teams (
        id INT IDENTITY(1,1) PRIMARY KEY,
        team NVARCHAR(200) NOT NULL UNIQUE
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM db_owner.user_teams)
BEGIN
    INSERT INTO db_owner.user_teams (team)
    VALUES (N'Unassigned'), (N'Template Team');
END;
GO

IF OBJECT_ID(N'db_owner.validUsers', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.validUsers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(150) NOT NULL UNIQUE,
        team INT NULL REFERENCES db_owner.user_teams(id),
        role INT NULL REFERENCES db_owner.user_roles(id),
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO

MERGE db_owner.validUsers AS target
USING (VALUES
    (N'user', 1, 1),
    (N'admin', 1, 2),
    (N'superadmin', 1, 3)
) AS source(username, team, role)
ON target.username = source.username
WHEN MATCHED THEN
    UPDATE SET team = source.team, role = source.role
WHEN NOT MATCHED THEN
    INSERT (username, team, role)
    VALUES (source.username, source.team, source.role);
GO

IF OBJECT_ID(N'db_owner.userRequests', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.userRequests (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(150) NOT NULL,
        team INT NULL REFERENCES db_owner.user_teams(id),
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO

IF OBJECT_ID(N'db_owner.admin_pass', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.admin_pass (
        id INT IDENTITY(1,1) PRIMARY KEY,
        role INT NOT NULL REFERENCES db_owner.user_roles(id),
        pass NVARCHAR(255) NOT NULL
    );
END;
GO

IF EXISTS (SELECT 1 FROM db_owner.admin_pass WHERE role = 1)
BEGIN
    DELETE FROM db_owner.admin_pass WHERE role = 1;
END;

IF EXISTS (SELECT 1 FROM db_owner.admin_pass WHERE role = 2)
BEGIN
    IF EXISTS (SELECT 1 FROM db_owner.admin_pass WHERE role = 2 AND pass IN (N'owner', N'admin'))
    BEGIN
        UPDATE db_owner.admin_pass SET pass = N'admin' WHERE role = 2;
    END;
END
ELSE
BEGIN
    INSERT INTO db_owner.admin_pass (role, pass)
    VALUES (2, N'admin');
END;

IF EXISTS (SELECT 1 FROM db_owner.admin_pass WHERE role = 3)
BEGIN
    IF EXISTS (SELECT 1 FROM db_owner.admin_pass WHERE role = 3 AND pass IN (N'user', N'superadmin'))
    BEGIN
        UPDATE db_owner.admin_pass SET pass = N'superadmin' WHERE role = 3;
    END;
END
ELSE
BEGIN
    INSERT INTO db_owner.admin_pass (role, pass)
    VALUES (3, N'superadmin');
END;
GO

IF OBJECT_ID(N'db_owner.colors', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.colors (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Hex NVARCHAR(7) NOT NULL
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM db_owner.colors)
BEGIN
    INSERT INTO db_owner.colors (Name, Hex)
    VALUES (N'Green', N'#4caf50'),
           (N'Red', N'#f44336'),
           (N'Blue', N'#2196f3');
END;
GO

IF OBJECT_ID(N'db_owner.projectModel', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.projectModel (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        onTimeDate DATE NULL,
        PEM NVARCHAR(255) NULL,
        COMMENT NVARCHAR(MAX) NULL,
        POdate DATE NULL,
        SFdate DATE NULL,
        archive NVARCHAR(5) NOT NULL DEFAULT N'false',
        team INT NULL REFERENCES db_owner.user_teams(id),
        template NVARCHAR(5) NOT NULL DEFAULT N'false'
    );
END;
GO

IF OBJECT_ID(N'db_owner.gateModel', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.gateModel (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        prosjektId INT NOT NULL REFERENCES db_owner.projectModel(ID),
        stage INT NOT NULL,
        gateTitle NVARCHAR(255) NOT NULL
    );
END;
GO

IF OBJECT_ID(N'db_owner.taskModel', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.taskModel (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        prosjektID INT NOT NULL REFERENCES db_owner.projectModel(ID),
        gateID INT NOT NULL REFERENCES db_owner.gateModel(ID),
        step INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        responsiblePerson NVARCHAR(255) NULL,
        onTimeDate DATE NULL,
        progress INT NOT NULL DEFAULT 0,
        duration INT NOT NULL DEFAULT 0
    );
END;
GO

IF OBJECT_ID(N'db_owner.stages', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.stages (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        projectID INT NOT NULL REFERENCES db_owner.projectModel(ID),
        nr INT NOT NULL,
        hex NVARCHAR(7) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        weight DECIMAL(5,2) NOT NULL
    );
END;
GO

IF OBJECT_ID(N'db_owner.gatedivider', N'U') IS NULL
BEGIN
    CREATE TABLE db_owner.gatedivider (
        prosjektID INT NOT NULL REFERENCES db_owner.projectModel(ID),
        divider INT NOT NULL,
        CONSTRAINT PK_gatedivider PRIMARY KEY (prosjektID, divider)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM db_owner.projectModel)
BEGIN
    INSERT INTO db_owner.projectModel (title, onTimeDate, PEM, COMMENT, POdate, SFdate, archive, team, template)
    VALUES (N'Sample Template Project', CAST(GETDATE() AS DATE), N'Jane Doe', N'Initial template project', CAST(GETDATE() AS DATE), DATEADD(DAY, 30, CAST(GETDATE() AS DATE)), N'false', 2, N'true');
END;
GO

DECLARE @TemplateProjectID INT = (SELECT TOP(1) ID FROM db_owner.projectModel WHERE template = N'true' ORDER BY ID);

IF NOT EXISTS (SELECT 1 FROM db_owner.gateModel WHERE prosjektId = @TemplateProjectID)
BEGIN
    INSERT INTO db_owner.gateModel (prosjektId, stage, gateTitle)
    VALUES (@TemplateProjectID, 1, N'Gate 1'),
           (@TemplateProjectID, 2, N'Gate 2');
END;
GO

IF NOT EXISTS (SELECT 1 FROM db_owner.taskModel WHERE prosjektID = @TemplateProjectID)
BEGIN
    DECLARE @Gate1 INT = (SELECT TOP(1) ID FROM db_owner.gateModel WHERE prosjektId = @TemplateProjectID AND stage = 1);
    DECLARE @Gate2 INT = (SELECT TOP(1) ID FROM db_owner.gateModel WHERE prosjektId = @TemplateProjectID AND stage = 2);

    INSERT INTO db_owner.taskModel (prosjektID, gateID, step, title, responsiblePerson, onTimeDate, progress, duration)
    VALUES (@TemplateProjectID, @Gate1, 1, N'Plan project scope', N'Alice', CAST(GETDATE() AS DATE), 50, 5),
           (@TemplateProjectID, @Gate1, 2, N'Assemble team', N'Bob', DATEADD(DAY, 7, CAST(GETDATE() AS DATE)), 20, 10),
           (@TemplateProjectID, @Gate2, 1, N'Execute deliverables', N'Charlie', DATEADD(DAY, 14, CAST(GETDATE() AS DATE)), 10, 15);
END;
GO

IF NOT EXISTS (SELECT 1 FROM db_owner.stages WHERE projectID = @TemplateProjectID)
BEGIN
    INSERT INTO db_owner.stages (projectID, nr, hex, name, weight)
    VALUES (@TemplateProjectID, 1, N'#4caf50', N'Planning', 0.3),
           (@TemplateProjectID, 2, N'#2196f3', N'Execution', 0.7);
END;
GO

IF NOT EXISTS (SELECT 1 FROM db_owner.gatedivider WHERE prosjektID = @TemplateProjectID)
BEGIN
    INSERT INTO db_owner.gatedivider (prosjektID, divider)
    VALUES (@TemplateProjectID, 50);
END;
GO

IF OBJECT_ID(N'db_owner.ProjectAverageProgress', N'V') IS NOT NULL
BEGIN
    DROP VIEW db_owner.ProjectAverageProgress;
END;
GO

CREATE VIEW db_owner.ProjectAverageProgress
AS
SELECT
    p.ID,
    COALESCE(AVG(CAST(t.progress AS DECIMAL(5,2))), 0) AS AverageProgress
FROM db_owner.projectModel p
LEFT JOIN db_owner.taskModel t ON p.ID = t.prosjektID
GROUP BY p.ID;
GO

IF OBJECT_ID(N'db_owner.DuplicateProject', N'P') IS NOT NULL
BEGIN
    DROP PROCEDURE db_owner.DuplicateProject;
END;
GO

CREATE PROCEDURE db_owner.DuplicateProject
    @OldProjectID INT,
    @NewProjectTitle NVARCHAR(255),
    @PEMName NVARCHAR(255),
    @PODate DATE,
    @SFDate DATE,
    @team INT,
    @template BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM db_owner.projectModel WHERE ID = @OldProjectID)
    BEGIN
        RAISERROR('Template project not found.', 16, 1);
        RETURN;
    END;

    DECLARE @TemplateValue NVARCHAR(5) = CASE WHEN @template = 1 THEN N'true' ELSE N'false' END;

    INSERT INTO db_owner.projectModel (title, onTimeDate, PEM, COMMENT, POdate, SFdate, archive, team, template)
    SELECT
        @NewProjectTitle,
        onTimeDate,
        @PEMName,
        COMMENT,
        @PODate,
        @SFDate,
        archive,
        @team,
        @TemplateValue
    FROM db_owner.projectModel
    WHERE ID = @OldProjectID;

    DECLARE @NewProjectID INT = SCOPE_IDENTITY();

    INSERT INTO db_owner.gateModel (prosjektId, stage, gateTitle)
    SELECT @NewProjectID, stage, gateTitle
    FROM db_owner.gateModel
    WHERE prosjektId = @OldProjectID;

    INSERT INTO db_owner.taskModel (prosjektID, gateID, step, title, responsiblePerson, onTimeDate, progress, duration)
    SELECT
        @NewProjectID,
        gNew.ID,
        t.step,
        t.title,
        t.responsiblePerson,
        t.onTimeDate,
        0,
        t.duration
    FROM db_owner.taskModel t
    JOIN db_owner.gateModel gOld ON t.gateID = gOld.ID
    JOIN db_owner.gateModel gNew ON gNew.prosjektId = @NewProjectID AND gNew.stage = gOld.stage
    WHERE t.prosjektID = @OldProjectID;

    INSERT INTO db_owner.gatedivider (prosjektID, divider)
    SELECT @NewProjectID, divider
    FROM db_owner.gatedivider
    WHERE prosjektID = @OldProjectID;

    INSERT INTO db_owner.stages (projectID, nr, hex, name, weight)
    SELECT @NewProjectID, nr, hex, name, weight
    FROM db_owner.stages
    WHERE projectID = @OldProjectID;

    SELECT @NewProjectID AS NewProjectID;
END;
GO

IF OBJECT_ID(N'db_owner.AdjustAndInsertGate', N'P') IS NOT NULL
BEGIN
    DROP PROCEDURE db_owner.AdjustAndInsertGate;
END;
GO

CREATE PROCEDURE db_owner.AdjustAndInsertGate
    @ProsjektID INT,
    @GateNR INT,
    @GateTitle NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE db_owner.gateModel
    SET stage = stage + 1
    WHERE prosjektId = @ProsjektID AND stage >= @GateNR;

    INSERT INTO db_owner.gateModel (prosjektId, stage, gateTitle)
    VALUES (@ProsjektID, @GateNR, @GateTitle);

    DECLARE @NewGateID INT = SCOPE_IDENTITY();

    INSERT INTO db_owner.taskModel (prosjektID, gateID, step, title, responsiblePerson, onTimeDate, progress, duration)
    VALUES (@ProsjektID, @NewGateID, 1, CONCAT(@GateTitle, N' task'), NULL, NULL, 0, 0);

    SELECT @NewGateID AS GateID;
END;
GO
