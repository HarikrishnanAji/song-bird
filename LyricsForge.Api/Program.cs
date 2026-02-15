using LyricsForge.Api.Helpers;
using LyricsForge.Api.Helpers.Interfaces;
using LyricsForge.Api.Services;
using LyricsForge.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IFfmpegService, FfmpegService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IWhisperService, WhisperService>();
builder.Services.AddScoped<ILyricsMapper, LyricsMapper>();
builder.Services.AddScoped<IProcessRunner, ProcessRunner>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
