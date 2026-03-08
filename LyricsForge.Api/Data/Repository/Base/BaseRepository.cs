using System;
using Microsoft.EntityFrameworkCore;

namespace LyricsForge.Api.Data.Repository.Base;

public class BaseRepository<T> where T : class
{
    protected readonly AppDBContext _context;
    private readonly DbSet<T> _dbSet;

    public BaseRepository(AppDBContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<T> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<T> entities)
        => await _dbSet.AddRangeAsync(entities);
    public virtual async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }
    }
}
