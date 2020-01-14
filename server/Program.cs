using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Sby
{
  public class Program
    {
        public static void Main(string[] args)
        {
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
        }
    }
}
