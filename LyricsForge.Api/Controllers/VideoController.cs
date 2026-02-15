using LyricsForge.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LyricsForge.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly IJobService _jobService;

        public VideoController(IJobService jobService)
        {
            _jobService = jobService;
        }
        public async Task<IActionResult> CreateVideoAsync(IFormFile audio, IFormFile lyrics)
        {
            try
            {
                var videoUrl = await _jobService.CreateJobAsync(audio, lyrics);
                return Ok(new { videoUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while processing the request.");
            }
    }
}}
