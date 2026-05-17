using System;
using Microsoft.EntityFrameworkCore;

namespace SongBird.Api.Data.Repository.Base;

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
    public async Task AddRangeAsync(IEnumerable<T> entities)
        => await _dbSet.AddRangeAsync(entities);

    public virtual async Task AddAsync(T entity)
    {
        try
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }
        catch(Exception ex)
        {
            throw new Exception($"Error adding entity: {ex.Message}");
        }
    }

    public virtual async Task UpdateAsync(T entity)
    {
        try
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }
        catch(Exception ex)
        {
            throw new Exception($"Error updating entity: {ex.Message}");
        }
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        try
        {
            var data = await GetByIdAsync(id);
            if (data != null)
            {
                _dbSet.Remove(data);
                await _context.SaveChangesAsync();
            }
        }
        catch(Exception ex)
        {
            throw new Exception($"Error deleting entity: {ex.Message}");
        }
    }
}
