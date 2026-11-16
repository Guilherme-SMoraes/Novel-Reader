using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NovelReader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCharacterAppearancesPerFormat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterAppearances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CharacterId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkType = table.Column<int>(type: "integer", nullable: false),
                    AppearanceVolume = table.Column<int>(type: "integer", nullable: true),
                    AppearanceChapter = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterAppearances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CharacterAppearances_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterAppearances_CharacterId_WorkType",
                table: "CharacterAppearances",
                columns: new[] { "CharacterId", "WorkType" },
                unique: true);

            migrationBuilder.Sql(@"
                INSERT INTO ""CharacterAppearances"" (""Id"", ""CharacterId"", ""WorkType"", ""AppearanceChapter"", ""AppearanceVolume"")
                SELECT gen_random_uuid(), ""Id"", 2, ""AppearanceChapter"", ""AppearanceVolume""
                FROM ""Characters"";
            ");

            migrationBuilder.DropColumn(
                name: "AppearanceChapter",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "AppearanceVolume",
                table: "Characters");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AppearanceChapter",
                table: "Characters",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AppearanceVolume",
                table: "Characters",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""Characters"" c
                SET ""AppearanceChapter"" = ca.""AppearanceChapter"",
                    ""AppearanceVolume"" = ca.""AppearanceVolume""
                FROM ""CharacterAppearances"" ca
                WHERE c.""Id"" = ca.""CharacterId"";
            ");

            migrationBuilder.DropTable(
                name: "CharacterAppearances");
        }
    }
}
