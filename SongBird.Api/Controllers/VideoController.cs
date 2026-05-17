using SongBird.Api.DTOs;
using SongBird.Api.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace SongBird.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly IRenderService _renderService;
        private readonly ILrcService _lrcService;
        public VideoController(
            IRenderService renderService,
            ILrcService lrcService)
        {
            _renderService = renderService;
            _lrcService = lrcService;
        }

        /// <summary>
        /// Create project and upload audio + background
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> CreateProject([FromForm] CreateVideoDto dto)
        {
            var response = "";
            try
            {            
                response = await _renderService.CreateProjectAsync(dto);
            }
            catch(Exception ex)
            {
                throw new Exception(ex.StackTrace); 
            }
            return Ok(response); 
        }

        /// <summary>
        /// Extract LRC
        /// </summary>
        [HttpPost("lrc")]
        public async Task<IActionResult> HandleLrc(Guid id, string? artist, string? title, IFormFile? lrcFile = null)
        {
            var project = await _renderService.GetByIdAsync(id);
            if (project == null)
                return NotFound("Project not found");
            string lrcContent;
            if (lrcFile != null && lrcFile.Length > 0)
            {
                if (!Path.GetExtension(lrcFile.FileName).Equals(".lrc", StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Only .lrc files are allowed");

                using var reader = new StreamReader(lrcFile.OpenReadStream());
                lrcContent = await reader.ReadToEndAsync();

                if (string.IsNullOrWhiteSpace(lrcContent))
                    return BadRequest("Empty LRC file");
            }
            else
            {
                if (string.IsNullOrWhiteSpace(artist) || string.IsNullOrWhiteSpace(title))
                    return BadRequest("Artist and Title required if no file provided");

                lrcContent = await _lrcService.GetLrc(artist, title);

                if (string.IsNullOrWhiteSpace(lrcContent))
                    return BadRequest("LRC not found from API");
            }

            var lrcPath = await _lrcService.SaveLrc(id, lrcContent);

            project.LrcPath = lrcPath;
            project.Status = "LRC Ready"; 
            await _renderService.UpdateAsync(project);
            return Ok(new { lrcPath });
        }

        /// <summary>
        /// Render Video
        /// </summary>
        [HttpPost("render")]
        public async Task<IActionResult> Render(Guid id, IFormFile? srtFile = null, bool isShort = false)
        {
            var project = await _renderService.GetByIdAsync(id);

            if (project == null)
                return NotFound();

            string srtPath;
            if (srtFile != null && srtFile.Length > 0)
            {
                if (!Path.GetExtension(srtFile.FileName).Equals(".srt", StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Only .srt files allowed");

                var folder = Path.Combine("Storage", id.ToString(), "Srt");
                Directory.CreateDirectory(folder);

                srtPath = Path.Combine(folder, $"{id}.srt");

                using var stream =  System.IO.File.Create(srtPath);
                await srtFile.CopyToAsync(stream);
            }
            else
            {
                var lyrics = _lrcService.Parse(project.LrcPath);
                srtPath = await _lrcService.SaveAsSrt(id, lyrics);
            }

            var videoPath = await _renderService.RenderAsync(
                project.AudioPath,
                project.BackgroundPath,
                srtPath,
                id,
                project.Title,
                isShort);

            project.VideoPath = videoPath;
            project.Status = "Video Generated";
            await _renderService.UpdateAsync(project);

            return Ok(new { videoPath });
        }

        /// <summary>
        /// Get all project details
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await _renderService.GetAllAsync();

            return projects == null || !projects.Any()
                ? NotFound("No projects found")
                : Ok(projects.Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.AudioPath,
                    p.BackgroundPath,
                    p.LrcPath,
                    p.VideoPath,
                    p.Status
                }));
        }
        
    }
}
