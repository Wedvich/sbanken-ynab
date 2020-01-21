using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Sby
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseXContentTypeOptions();
            app.UseXfo(options => options.SameOrigin());
            app.UseXXssProtection(options => options.EnabledWithBlockMode());
            app.UseXRobotsTag(options => options.NoIndex().NoFollow());
            app.UseReferrerPolicy(opts => opts.SameOrigin());

            app.UseCsp(options => options
                .FontSources(action => action
                    .Self()
                    .CustomSources("https://fonts.gstatic.com"))
                .ObjectSources(action => action.None())
                .ScriptSources(action => action.Self())
                .StyleSources(action => action
                    .Self()
                    .UnsafeInline()
                    .CustomSources("https://fonts.googleapis.com/css"))
            );

            app.UseDefaultFiles(new DefaultFilesOptions
            {
                DefaultFileNames = new List<string> { "index.html" }
            });

            app.UseStaticFiles();

            app.Run(async (context) =>
            {
                context.Response.ContentType = "text/html";
                await context.Response.SendFileAsync(Path.Combine(env.WebRootPath, "index.html"));
            });
        }
    }
}
