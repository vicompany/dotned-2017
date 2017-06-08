using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Orleans;

using Stock.Interfaces;
using Stock.Website.Models;

namespace Stock.Website
{
    public class Startup
    {
        public static SocketHandler socketHandler = new SocketHandler();
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();
            app.UseWebSockets();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
            app.Use(async (context, next) =>
                {
                    if (context.Request.Path == "/ws")
                    {
                        if (context.WebSockets.IsWebSocketRequest)
                        {
                            WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                            await this.HandleWebSocket(context, webSocket);
                        }
                        else
                        {
                            context.Response.StatusCode = 400;
                        }
                    }
                    else
                    {
                        await next();
                    }
                }); 
        } 

        private async Task HandleWebSocket(HttpContext context, WebSocket webSocket)
        {
            string ok = "OK";
            var buffer = new byte[1024 * 4];

            while (!webSocket.CloseStatus.HasValue)
            {
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                var fundName = Encoding.UTF8.GetString(buffer, 0, result.Count);
                if (!string.IsNullOrEmpty(fundName))
                {
                    var grain = GrainClient.GrainFactory.GetGrain<IFund>(fundName);
                    try
                    {
                        socketHandler.AddSocket(webSocket);

                        await grain.SetListener(socketHandler.ObserverRef);
                        
                    }
                    catch (Exception exc)
                    {
                        Console.WriteLine(exc);
                        throw;
                    }
                }
            }
            socketHandler.RemoveSocket(webSocket);
            
            await webSocket.CloseAsync(webSocket.CloseStatus.Value, "End", CancellationToken.None);
        }
    }
}
