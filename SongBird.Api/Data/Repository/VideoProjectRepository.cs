using System;
using SongBird.Api.Data.Repository.Base;
using SongBird.Api.Data.Repository.Interface;
using SongBird.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace SongBird.Api.Data.Repository;

public class VideoProjectRepository:BaseRepository<VideoProject>,IVideoProjectRepository
{
    public VideoProjectRepository(AppDBContext appDBContext):base(appDBContext)
    {
    }
}
