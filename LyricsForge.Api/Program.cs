

using Hangfire;
using LyricsForge.Api.Data;
using LyricsForge.Api.Data.Repository;
using LyricsForge.Api.Data.Repository.Base;
using LyricsForge.Api.Data.Repository.Interface;
using LyricsForge.Api.Helper;
using LyricsForge.Api.Service;
using LyricsForge.Api.Service.Interface;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDBContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddTransient(typeof(BaseRepository<>));
builder.Services.AddTransient<IVideoProjectRepository, VideoProjectRepository>();
builder.Services.AddTransient<ILyricsLineRepository, LyricsLineRepository>();
builder.Services.AddTransient<IRenderService, RenderService>();
builder.Services.AddTransient<RenderJob>();

builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.Run();
