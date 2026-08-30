using System;
using SongBird.Api.Data.Models;
using SongBird.Api.Data.Repository.Base;
using SongBird.Api.Data.Repository.Interface;

namespace SongBird.Api.Data.Repository;

public class EffectRepository:BaseRepository<Effect>
{
    public EffectRepository(AppDBContext appDBContext):base(appDBContext)
    {
    }
}
