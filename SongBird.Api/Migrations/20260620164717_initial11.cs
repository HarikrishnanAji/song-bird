using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SongBird.Api.Migrations
{
    /// <inheritdoc />
    public partial class initial11 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_VideoProjects",
                table: "VideoProjects");

            migrationBuilder.DropColumn(
                name: "VideoId",
                table: "VideoProjects");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VideoProjects",
                table: "VideoProjects",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_VideoProjects",
                table: "VideoProjects");

            migrationBuilder.AddColumn<int>(
                name: "VideoId",
                table: "VideoProjects",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VideoProjects",
                table: "VideoProjects",
                column: "VideoId");
        }
    }
}
