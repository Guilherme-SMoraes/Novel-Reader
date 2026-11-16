using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NovelReader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceAndIntegrityIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Progresses_WorkId_WorkType",
                table: "Progresses");

            migrationBuilder.DropIndex(
                name: "IX_Characters_WorkId",
                table: "Characters");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_WorkId",
                table: "Attachments");

            migrationBuilder.CreateIndex(
                name: "IX_Works_Title",
                table: "Works",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_Progresses_WorkId_WorkType_StoppedAt",
                table: "Progresses",
                columns: new[] { "WorkId", "WorkType", "StoppedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Genres_Name",
                table: "Genres",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Characters_WorkId_CharacterType_Name",
                table: "Characters",
                columns: new[] { "WorkId", "CharacterType", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_WorkId_CreatedAt",
                table: "Attachments",
                columns: new[] { "WorkId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Works_Title",
                table: "Works");

            migrationBuilder.DropIndex(
                name: "IX_Progresses_WorkId_WorkType_StoppedAt",
                table: "Progresses");

            migrationBuilder.DropIndex(
                name: "IX_Genres_Name",
                table: "Genres");

            migrationBuilder.DropIndex(
                name: "IX_Characters_WorkId_CharacterType_Name",
                table: "Characters");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_WorkId_CreatedAt",
                table: "Attachments");

            migrationBuilder.CreateIndex(
                name: "IX_Progresses_WorkId_WorkType",
                table: "Progresses",
                columns: new[] { "WorkId", "WorkType" });

            migrationBuilder.CreateIndex(
                name: "IX_Characters_WorkId",
                table: "Characters",
                column: "WorkId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_WorkId",
                table: "Attachments",
                column: "WorkId");
        }
    }
}
