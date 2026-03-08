using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LyricsForge.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VideoProjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BackgroundPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OutputPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoProjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LyricsLines",
                columns: table => new
                {
                    LyricsLineId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartTime = table.Column<double>(type: "float", nullable: false),
                    EndTime = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LyricsLines", x => x.LyricsLineId);
                    table.ForeignKey(
                        name: "FK_LyricsLines_VideoProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "VideoProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LyricsLines_ProjectId",
                table: "LyricsLines",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LyricsLines");

            migrationBuilder.DropTable(
                name: "VideoProjects");
        }
    }
}
