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
                return BadRequest(ex.StackTrace); 
            }
            return Ok(response); 
        }

        /// <summary>
        /// Render Video
        /// </summary>
        [HttpPost("render")]
        public async Task<IActionResult> Render(Guid id, IFormFile? srtFile = null, AppFontEnum fontName = AppFontEnum.MagicalStylishScriptDemo, bool isShort = false)
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
                GetFontName(fontName),
                isShort);
            project.IsShort = isShort;
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
                    p.Status,
                    p.IsShort
                }));
        }
        
        /// <summary>
        /// Download Videos
        /// </summary>
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadVideo(Guid id)
        {
            var filePath = await _renderService.DownloadVideoAsync(id);
         
            return PhysicalFile(
                filePath,
                "video/mp4",
                Path.GetFileName(filePath)
            );
        }
        #region  Private Methods
        private static string GetFontName(AppFontEnum font)
        {
            return font switch
            {
                AppFontEnum.EdoSZ => "EDO SZ",
                AppFontEnum.MagicalStylishScriptDemo => "Magical Stylish Script Demo",
                AppFontEnum.Malvides => "Malvides",
                AppFontEnum.HighEmpathy => "High Empathy",
                AppFontEnum.TheGwathmey => "The Gwathmey",
                AppFontEnum.Charcoal => "Charcoal",
                _ => "EDO SZ"
            };
        }
        #endregion
    }
}
