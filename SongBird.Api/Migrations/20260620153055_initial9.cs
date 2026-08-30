using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SongBird.Api.Migrations
{
    /// <inheritdoc />
    public partial class initial9 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RenderProgress",
                table: "VideoProjects");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RenderProgress",
                table: "VideoProjects",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
