using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NovelReader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleAndWhitelist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "User");

            migrationBuilder.CreateTable(
                name: "WhitelistEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhitelistEntries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WhitelistEntries_Email",
                table: "WhitelistEntries",
                column: "Email",
                unique: true);

            migrationBuilder.Sql(@"
                UPDATE ""Users""
                SET ""Role"" = 'Admin'
                WHERE LOWER(""Email"") = 'guisanmo1@gmail.com';

                INSERT INTO ""WhitelistEntries"" (""Id"", ""Email"", ""CreatedAt"", ""CreatedBy"")
                VALUES (gen_random_uuid(), 'guisanmo1@gmail.com', NOW() AT TIME ZONE 'UTC', 'System')
                ON CONFLICT (""Email"") DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WhitelistEntries");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }
    }
}
