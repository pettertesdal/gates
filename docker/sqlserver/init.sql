IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'gates')
BEGIN
    CREATE DATABASE [gates];
END;
GO

USE [gates];
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
