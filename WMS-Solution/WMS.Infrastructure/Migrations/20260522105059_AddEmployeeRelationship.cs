using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "UserLogins",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_UserLogins_EmployeeId",
                table: "UserLogins",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserLogins_Employees_EmployeeId",
                table: "UserLogins",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "EmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserLogins_Employees_EmployeeId",
                table: "UserLogins");

            migrationBuilder.DropIndex(
                name: "IX_UserLogins_EmployeeId",
                table: "UserLogins");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "UserLogins");
        }
    }
}
