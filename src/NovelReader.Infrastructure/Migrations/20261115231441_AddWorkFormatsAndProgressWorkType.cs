using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NovelReader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkFormatsAndProgressWorkType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Progresses_WorkId",
                table: "Progresses");

            migrationBuilder.CreateTable(
                name: "WorkFormats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkType = table.Column<int>(type: "integer", nullable: false),
                    TotalVolume = table.Column<int>(type: "integer", nullable: true),
                    TotalChapter = table.Column<int>(type: "integer", nullable: false),
                    TranslatedVolume = table.Column<int>(type: "integer", nullable: true),
                    TranslatedChapter = table.Column<int>(type: "integer", nullable: true),
                    TranslatedLanguage = table.Column<int>(type: "integer", nullable: true),
                    LinkWhereToRead = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkFormats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkFormats_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddColumn<int>(
                name: "WorkType",
                table: "Progresses",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.Sql(@"
                INSERT INTO ""WorkFormats"" (""Id"", ""WorkId"", ""WorkType"", ""TotalChapter"", ""TotalVolume"", ""TranslatedChapter"", ""TranslatedVolume"", ""TranslatedLanguage"", ""LinkWhereToRead"")
                SELECT gen_random_uuid(), ""Id"", ""WorkType"", ""TotalChapter"", ""TotalVolume"", ""TranslatedChapter"", ""TranslatedVolume"", ""TranslatedLanguage"", ""LinkWhereToRead""
                FROM ""Works"";
            ");

            migrationBuilder.Sql(@"
                UPDATE ""Progresses"" p
                SET ""WorkType"" = w.""WorkType""
                FROM ""Works"" w
                WHERE p.""WorkId"" = w.""Id"";
            ");

            migrationBuilder.DropColumn(
                name: "LinkWhereToRead",
                table: "Works");

            migrationBuilder.DropColumn(
                name: "TotalChapter",
                table: "Works");

            migrationBuilder.DropColumn(
                name: "TotalVolume",
                table: "Works");

            migrationBuilder.DropColumn(
                name: "TranslatedChapter",
                table: "Works");

            migrationBuilder.DropColumn(
                name: "TranslatedLanguage",
                table: "Works");

            migrationBuilder.DropColumn(
                name: "TranslatedVolume",
                table: "Works");

            migrationBuilder.DropColumn(
                name: "WorkType",
                table: "Works");

            migrationBuilder.CreateIndex(
                name: "IX_Progresses_WorkId_WorkType",
                table: "Progresses",
                columns: new[] { "WorkId", "WorkType" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkFormats_WorkId_WorkType",
                table: "WorkFormats",
                columns: new[] { "WorkId", "WorkType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkFormats");

            migrationBuilder.DropIndex(
                name: "IX_Progresses_WorkId_WorkType",
                table: "Progresses");

            migrationBuilder.DropColumn(
                name: "WorkType",
                table: "Progresses");

            migrationBuilder.AddColumn<string>(
                name: "LinkWhereToRead",
                table: "Works",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalChapter",
                table: "Works",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalVolume",
                table: "Works",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TranslatedChapter",
                table: "Works",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TranslatedLanguage",
                table: "Works",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TranslatedVolume",
                table: "Works",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkType",
                table: "Works",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Progresses_WorkId",
                table: "Progresses",
                column: "WorkId");
        }
    }
}
