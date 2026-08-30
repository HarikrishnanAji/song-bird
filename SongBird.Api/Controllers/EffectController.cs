using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SongBird.Api.Service.Interface;

namespace SongBird.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EffectController : ControllerBase
    {
        private readonly IEffectService _effectService;
        public EffectController(IEffectService effectService)
        {
            _effectService = effectService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            IFormFile file,
            string type,
            string name)
        {
            var result = await _effectService.AddEffectAsync(file, type, name);
            return Ok(result.Message);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            string? type)
        {
            var effects = await _effectService.GetAllEffectsAsync(type);
            return Ok(effects);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _effectService.DeleteEffectAsync(id);
            return Ok();
        }
    }
}
