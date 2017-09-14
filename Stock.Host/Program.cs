using System;

using Microsoft.Extensions.DependencyInjection;

using Orleans.Runtime.Configuration;

using Stock.Grains;
using Stock.Interfaces;

namespace Stock.Host
{
    public class Program
    {
        private static OrleansHostWrapper hostWrapper;

        public static int Main(string[] args)
        {
            var exitCode = StartSilo(args);

            Console.WriteLine("Press Enter to terminate...");
            Console.ReadLine();

            exitCode += ShutdownSilo();

            return exitCode;
        }

        private static int StartSilo(string[] args)
        {
            // define the cluster configuration
            var config = ClusterConfiguration.LocalhostPrimarySilo();
            config.AddMemoryStorageProvider();
           config.UseStartupType<OrleansStartup>();
            // config.Defaults.DefaultTraceLevel = Orleans.Runtime.Severity.Verbose3;
            hostWrapper = new OrleansHostWrapper(config, args);

            return hostWrapper.Run();
        }

        private static int ShutdownSilo()
        {
            if (hostWrapper != null)
            {
                return hostWrapper.Stop();
            }

            return 0;
        }
    }

    internal class OrleansStartup
    {
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<IFund, FundGrain>(); 
            services.AddSingleton<IFundReporter, FundReporterGrain>();
            return services.BuildServiceProvider();
        }
    }
}