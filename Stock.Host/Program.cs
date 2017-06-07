using Orleans.Runtime.Configuration;
using Stock.Host;
using System;

namespace StockHost
{
    class Program
    {
        private static OrleansHostWrapper hostWrapper;

        static void Main(string[] args)
        {
            int exitCode = StartSilo(args);

            Console.WriteLine("Press Enter to terminate...");
            Console.ReadLine();

            exitCode += ShutdownSilo();

        }

        private static int StartSilo(string[] args)
        {
            // define the cluster configuration
            var config = ClusterConfiguration.LocalhostPrimarySilo(); 
            config.AddMemoryStorageProvider();
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
}