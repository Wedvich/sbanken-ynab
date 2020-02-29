using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Primitives;

namespace Sby
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public readonly KeyValuePair<string, StringValues> ServiceWorkerHeader =
            new KeyValuePair<string, StringValues>("service-worker", new StringValues("script"));

        public readonly ISet<string> ImmutableFileExtensions = new HashSet<string> {
            ".css",
            ".js",
            ".woff"
        };

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHttpsRedirection();
                app.UseHsts();
            }

            app.UseXContentTypeOptions();
            app.UseXfo(options => options.SameOrigin());
            app.UseXXssProtection(options => options.EnabledWithBlockMode());
            app.UseXRobotsTag(options => options.NoIndex().NoFollow());
            app.UseReferrerPolicy(opts => opts.SameOrigin());
            app.UseCsp(options => options
                .FontSources(action => action.Self())
                .ObjectSources(action => action.None())
                .ScriptSources(action => action.Self())
                .StyleSources(action => action.Self().UnsafeInline())
            );

            app.UseDefaultFiles(new DefaultFilesOptions
            {
                DefaultFileNames = new List<string> { "index.html" }
            });

            app.Use(async (context, next) =>
            {
                if (context.Request.Path.Value.EndsWith("/sw.js"))
                {
                    if (!context.Request.Headers.Contains(ServiceWorkerHeader))
                    {
                        context.Response.StatusCode = 400;
                        await context.Response.CompleteAsync();
                        return;
                    }

                    context.Response.Headers.Append("Service-Worker-Allowed", "/");
                    context.Response.Headers.Append("Cache-Control", "no-store");
                }

                await next();
            });

            app.UseStaticFiles(new StaticFileOptions {
                OnPrepareResponse = (context) =>
                {
                    if (ImmutableFileExtensions.Contains(Path.GetExtension(context.File.Name)) && context.File.Name != "sw.js")
                    {
                        context.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000,immutable");
                    }
                }
            });

            app.Run(async (context) =>
            {
                context.Response.ContentType = "text/html";
                await context.Response.SendFileAsync(Path.Combine(env.WebRootPath, "index.html"));
            });
        }
    }
}
