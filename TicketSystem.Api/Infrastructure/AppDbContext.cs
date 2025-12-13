using Microsoft.EntityFrameworkCore;
using TicketSystem.Api.Domain;

namespace TicketSystem.Api.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Ticket> Tickets => Set<Ticket>();
   

   public DbSet<User> Users => Set<User>();


}
