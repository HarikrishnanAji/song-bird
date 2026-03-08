using System;
using LyricsForge.Api.Service.Interface;

namespace LyricsForge.Api.Helper;

public class RenderJob
{
    private readonly IRenderService _renderService;
    public RenderJob(IRenderService renderService)
    {
        _renderService = renderService;
    }

    public async Task Execute(Guid projectId)
    {
        await _renderService.RenderAsync(projectId);
    }
}
