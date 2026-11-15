using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NovelReader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Genres",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genres", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Works",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: true),
                    WorkType = table.Column<int>(type: "integer", nullable: false),
                    AggregatorLink = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    LinkWhereToRead = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    TotalVolume = table.Column<int>(type: "integer", nullable: true),
                    TotalChapter = table.Column<int>(type: "integer", nullable: false),
                    TranslatedVolume = table.Column<int>(type: "integer", nullable: true),
                    TranslatedChapter = table.Column<int>(type: "integer", nullable: true),
                    OriginalLanguage = table.Column<int>(type: "integer", nullable: false),
                    TranslatedLanguage = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Works", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Characters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: true),
                    CharacterType = table.Column<int>(type: "integer", nullable: false),
                    AppearanceVolume = table.Column<int>(type: "integer", nullable: true),
                    AppearanceChapter = table.Column<int>(type: "integer", nullable: false),
                    WorkId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Characters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Characters_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Progresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkId = table.Column<Guid>(type: "uuid", nullable: false),
                    StoppedVolume = table.Column<int>(type: "integer", nullable: true),
                    StoppedChapter = table.Column<int>(type: "integer", nullable: false),
                    ReadingStatus = table.Column<int>(type: "integer", nullable: false),
                    ReadingDescription = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: true),
                    StoppedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Progresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Progresses_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkGenres",
                columns: table => new
                {
                    GenresId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkGenres", x => new { x.GenresId, x.WorkId });
                    table.ForeignKey(
                        name: "FK_WorkGenres_Genres_GenresId",
                        column: x => x.GenresId,
                        principalTable: "Genres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkGenres_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Characters_WorkId",
                table: "Characters",
                column: "WorkId");

            migrationBuilder.CreateIndex(
                name: "IX_Progresses_WorkId",
                table: "Progresses",
                column: "WorkId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkGenres_WorkId",
                table: "WorkGenres",
                column: "WorkId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Characters");

            migrationBuilder.DropTable(
                name: "Progresses");

            migrationBuilder.DropTable(
                name: "WorkGenres");

            migrationBuilder.DropTable(
                name: "Genres");

            migrationBuilder.DropTable(
                name: "Works");
        }
    }
}
