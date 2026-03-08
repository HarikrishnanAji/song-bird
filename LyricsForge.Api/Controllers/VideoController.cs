using Hangfire;
using LyricsForge.Api.Data.Repository.Interface;
using LyricsForge.Api.DTOs;
using LyricsForge.Api.Helper;
using LyricsForge.Api.Models;
using LyricsForge.Api.Service.Interface;
using LyricsForge.Api.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LyricsForge.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly IRenderService _renderService;
        public VideoController(
            IRenderService renderService)
        {
            _renderService = renderService;
        }
        [HttpPost("create")]
        public async Task<IActionResult> Create( CreateVideoDto dto)
        {
            var id = Guid.NewGuid();
            var projectPath = "Storage/"+$"{id}";
            Directory.CreateDirectory(projectPath);

            var audioPath = Path.Combine(projectPath, "audio_"+$"{id}.mp3");
            var bgPath = Path.Combine(projectPath, "bg_"+$"{id}.mp4");

            using (var stream = new FileStream(audioPath, FileMode.Create))
                await dto.Audio.CopyToAsync(stream);

            using (var stream = new FileStream(bgPath, FileMode.Create))
                await dto.Background.CopyToAsync(stream);
                await _renderService.AddVideoProjectAsync(id, dto.Title, audioPath, bgPath);
            return Ok("Success : " + id);
        }

        [HttpPost("{id}/lyrics")]
        public async Task<IActionResult> AddLyrics(Guid id, List<LyricsLine> lines)
        {
            await _renderService.AddRangeLyricsLinesAsync(id, lines);
            return Ok();
        }

        [HttpPost("{id}/render")]
        public IActionResult Render(Guid id)
        {
            BackgroundJob.Enqueue<RenderJob>(x => x.Execute(id));
            return Ok("Rendering started");
        }

        [HttpGet("{id}/status")]
        public async Task<IActionResult> Status(Guid id)
        {
            var project = await _renderService.GetVideoProjectWithLyricsByIdAsync(id);
            return Ok(project.Status);
        }
    }
}
