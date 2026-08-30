using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SongBird.Api.DTOs;
using SongBird.Api.Service.Interface;

namespace SongBird.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FontController : ControllerBase
    {
        private readonly IFontService _fontService;
        public FontController(IFontService fontService)
        {
            _fontService = fontService;
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateFont(IFormFile file,[FromForm] string name)
        {
            try
            {
                var font = await _fontService.UploadAsync(file, name);

                return Ok(font);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fonts = await _fontService.GetAllAsync();
            return Ok(fonts);
        } 
    }
}
