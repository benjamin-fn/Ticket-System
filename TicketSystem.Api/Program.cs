using System.Linq;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using TicketSystem.Api.Infrastructure;
using TicketSystem.Api.Application;
using TicketSystem.Api.Domain;

var builder = WebApplication.CreateBuilder(args);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core InMemory
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseInMemoryDatabase("TicketsDb"));

// JSON enums as strings
builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// CORS
builder.Services.AddCors(o =>
{
    o.AddPolicy("frontend", p => p
        .WithOrigins("http://localhost:5173", "http://localhost:5174")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");


// ======================== AUTH ========================

// REGISTER
app.MapPost("/api/auth/register", async (AppDbContext db, UserRegisterRequest req) =>
{
    if (new[] { req.FirstName, req.LastName, req.Email, req.Password }
        .Any(string.IsNullOrWhiteSpace))
    {
        return Results.BadRequest(new { error = "All fields are required." });
    }

    if (db.Users.Any(u => u.Email == req.Email))
        return Results.BadRequest(new { error = "User already exists." });

    var user = new User
    {
        FirstName = req.FirstName,
        LastName = req.LastName,
        Email = req.Email,
        Password = req.Password
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Ok(new { id = user.Id, email = user.Email });
});

// LOGIN
app.MapPost("/api/auth/login", async (AppDbContext db, UserLoginRequest req) =>
{
    var user = db.Users.FirstOrDefault(u => u.Email == req.Email && u.Password == req.Password);

    if (user == null)
        return Results.BadRequest(new { error = "Invalid credentials." });

    return Results.Ok(new
    {
        id = user.Id,
        email = user.Email,
        firstName = user.FirstName,
        lastName = user.LastName
    });
});


// ======================== TICKETS ========================

// LIST
app.MapGet("/api/tickets", async (AppDbContext db) =>
{
    var list = await db.Tickets
        .AsNoTracking()
        .OrderByDescending(t => t.UpdatedAt)
        .ToListAsync();

    return Results.Ok(list.Select(t => new
    {
        t.Id,
        t.Title,
        t.Description,
        Status = t.Status.ToString(),
        Priority = t.Priority.ToString(),
        t.IsFlagged,
        t.ReceivedAt,
        t.StartedAt,
        t.CompletedAt,
        t.UpdatedAt,
        t.OwnerId
    }));
});

// GET ONE
app.MapGet("/api/tickets/{id}", async (AppDbContext db, string id) =>
{
    var t = await db.Tickets.FirstOrDefaultAsync(x => x.Id.ToString() == id);

    if (t is null)
        return Results.NotFound(new { error = "Ticket not found." });

    return Results.Ok(new
    {
        t.Id,
        t.Title,
        t.Description,
        Status = t.Status.ToString(),
        Priority = t.Priority.ToString(),
        t.IsFlagged,
        t.ReceivedAt,
        t.StartedAt,
        t.CompletedAt,
        t.UpdatedAt,
        t.OwnerId
    });
});

// CREATE
app.MapPost("/api/tickets", async (AppDbContext db, CreateTicketRequest req) =>
{
    if (string.IsNullOrWhiteSpace(req.Title))
        return Results.BadRequest(new { error = "Title is required." });

    var now = DateTime.UtcNow;

    var t = new Ticket
    {
        Title = req.Title,
        Description = req.Description ?? string.Empty,
        Priority = Enum.TryParse<Priority>(req.Priority ?? "Medium", true, out var p)
            ? p : Priority.Medium,
        Status = TicketStatus.Open,
        IsFlagged = req.IsFlagged ?? false,
        ReceivedAt = now,
        UpdatedAt = now,
        OwnerId = req.OwnerId
    };

    db.Tickets.Add(t);
    await db.SaveChangesAsync();

    return Results.Created($"/api/tickets/{t.Id}", new
    {
        t.Id,
        t.Title,
        Status = t.Status.ToString(),
        Priority = t.Priority.ToString(),
        t.IsFlagged,
        t.ReceivedAt,
        t.UpdatedAt,
        t.OwnerId
    });
});

// UPDATE STATUS
app.MapPut("/api/tickets/{id}", async (AppDbContext db, string id, ChangeStatusRequest req) =>
{
    var t = await db.Tickets.FirstOrDefaultAsync(x => x.Id.ToString() == id);

    if (t is null)
        return Results.NotFound(new { error = "Ticket not found." });

    var allowed =
        (t.Status == TicketStatus.Open &&
            (req.Status == TicketStatus.InProgress || req.Status == TicketStatus.Closed)) ||
        (t.Status == TicketStatus.InProgress &&
            req.Status == TicketStatus.Closed);

    if (!allowed)
        return Results.BadRequest(new { error = "Invalid status transition." });

    if (t.Status == TicketStatus.Open && req.Status == TicketStatus.InProgress)
        t.StartedAt = DateTime.UtcNow;

    if (req.Status == TicketStatus.Closed)
        t.CompletedAt = DateTime.UtcNow;

    t.Status = req.Status;
    t.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        t.Id,
        t.Title,
        t.Description,
        Status = t.Status.ToString(),
        Priority = t.Priority.ToString(),
        t.IsFlagged,
        t.ReceivedAt,
        t.StartedAt,
        t.CompletedAt,
        t.UpdatedAt,
        t.OwnerId
    });
});

// FULL EDIT
app.MapPut("/api/tickets/{id}/edit", async (AppDbContext db, string id, UpdateTicketRequest req) =>
{
    var t = await db.Tickets.FirstOrDefaultAsync(x => x.Id.ToString() == id);

    if (t is null)
        return Results.NotFound(new { error = "Ticket not found." });

    t.Title = req.Title ?? t.Title;
    t.Description = req.Description ?? t.Description;

    if (!string.IsNullOrEmpty(req.Priority) &&
        Enum.TryParse<Priority>(req.Priority, true, out var newPrio))
        t.Priority = newPrio;

    if (req.IsFlagged.HasValue)
        t.IsFlagged = req.IsFlagged.Value;

    t.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        t.Id,
        t.Title,
        t.Description,
        Status = t.Status.ToString(),
        Priority = t.Priority.ToString(),
        t.IsFlagged,
        t.ReceivedAt,
        t.StartedAt,
        t.CompletedAt,
        t.UpdatedAt,
        t.OwnerId
    });
});

// DELETE
app.MapDelete("/api/tickets/{id}", async (AppDbContext db, string id) =>
{
    var t = await db.Tickets.FirstOrDefaultAsync(x => x.Id.ToString() == id);

    if (t is null)
        return Results.NotFound(new { error = "Ticket not found." });

    db.Tickets.Remove(t);
    await db.SaveChangesAsync();

    return Results.NoContent();
});


// ======================== SEED ========================

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (!db.Users.Any())
    {
        db.Users.Add(new User
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@test.com",
            Password = "1234"
        });
    }

    if (!db.Tickets.Any())
    {
        db.Tickets.AddRange(
            new Ticket
            {
                Title = "Can't log in",
                Description = "User gets an error when trying to sign in.",
                Priority = Priority.High,
                Status = TicketStatus.Open,
                OwnerId = "temp-user"
            },
            new Ticket
            {
                Title = "Checkout error",
                Description = "Total price incorrect sometimes.",
                Priority = Priority.Medium,
                Status = TicketStatus.InProgress,
                OwnerId = "temp-user"
            }
        );
    }

    await db.SaveChangesAsync();

    // DEBUG OUTPUT
    Console.WriteLine("---- USERS IN DATABASE ----");
    foreach (var u in db.Users)
        Console.WriteLine($"{u.FirstName} {u.LastName} | {u.Email} / {u.Password}");
}

app.Run();


// ========== REQUEST MODELS ==========
public record UserRegisterRequest(string FirstName, string LastName, string Email, string Password);
public record UserLoginRequest(string Email, string Password);

public record CreateTicketRequest(string Title, string? Description, string? Priority, bool? IsFlagged, string OwnerId);
public record ChangeStatusRequest(TicketStatus Status);
public record UpdateTicketRequest(string? Title, string? Description, string? Priority, bool? IsFlagged);
