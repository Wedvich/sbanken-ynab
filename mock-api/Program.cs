using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Sby.MockApi
{
    class Program
    {
        public static void Main(string[] args)
        {
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                        .UseUrls("http://*:4300")
                        .UseStartup<Startup>();
                })
                .Build()
                .Run();
        }
    }
}
