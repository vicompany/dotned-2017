using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Orleans;
using Orleans.Concurrency;
using Stock.Interfaces;
using Stock.Models;
using System;

namespace Stock.Grains
{
    [StatelessWorker]
    public class CachedFundReporterGrain : Grain, ICachedFundReporter
    {
        public override Task OnActivateAsync()
        {
            this.lifetime = TimeSpan.FromSeconds(10);
            this.lifetimeTimer = RegisterTimer(
              async state => {
                  var items = await this.AggregateData();
                  var cacheGrain = this.GrainFactory.GetGrain<ICacheGrain<List<FundReport>>>("report");
                  await cacheGrain.Set(items);
              },
              null,
              TimeSpan.FromSeconds(0),
              this.lifetime);

            return base.OnActivateAsync();
        }
        List<string> fundsToReportAbout = new List<string>();
        private IDisposable lifetimeTimer;
        private TimeSpan lifetime;

        public async Task<List<FundReport>> GetReport()
        {
            var cacheGrain = this.GrainFactory.GetGrain<ICacheGrain<List<FundReport>>>("report");
            var items = await cacheGrain.Get();

            return items;
        }

        private async Task<List<FundReport>> AggregateData()
        { 
            var report = new List<FundReport>();
            foreach(var fund in fundsToReportAbout)
            {
                var fundGrain = this.GrainFactory.GetGrain<IFund>(fund);
                var asks = await fundGrain.GetLatestAsk();
                var bids  = await fundGrain.GetLatestBid();

                report.Add(new FundReport(){
                    Name = fund,
                    AmountOfPrices = asks.Count() + bids.Count(),
                    AverageBid = bids.Average(),
                    AverageAsk = asks.Average()
                });
            }

            return report;
        }

        public Task ReportAboutFund(string fund)
        {
           this.fundsToReportAbout.Add(fund);
           return Task.CompletedTask;
        }

       
    }
}