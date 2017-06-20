using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Orleans;
using Orleans.Concurrency;
using Stock.Interfaces;
using Stock.Models;

namespace Stock.Grains
{
    [StatelessWorker]
    public class FundReporterGrain : Grain, IFundReporter
    {
        List<string> fundsToReportAbout = new List<string>();
        
        public Task TrackFund(string fund)
        {
           this.fundsToReportAbout.Add(fund);
           return Task.CompletedTask;
        }

        public async  Task<List<FundReport>> GetReport()
        {
            var report = new List<FundReport>();
            foreach(var fund in fundsToReportAbout)
            {
                var fundGrain = this.GrainFactory.GetGrain<IFund>(fund);
                var asks = await fundGrain.GetLatestAskPrices();
                var bids  = await fundGrain.GetLatestBidPrices();

                report.Add(new FundReport(){
                    Name = fund,
                    AmountOfPrices = asks.Count() + bids.Count(),
                    AverageBid = bids.Average(),
                    AverageAsk = asks.Average()
                });
            }

            return report;
        }

        

      
    }
}