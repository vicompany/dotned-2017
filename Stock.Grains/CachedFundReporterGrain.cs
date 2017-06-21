using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Orleans;
using Orleans.Concurrency;

using Stock.Interfaces;
using Stock.Models;

namespace Stock.Grains
{
    [StatelessWorker]
    public class CachedFundReporterGrain : Grain, ICachedFundReporter
    {
        private readonly List<string> fundsToReportAbout = new List<string>();

        private IDisposable lifetimeTimer;

        private TimeSpan lifetime;

        public override Task OnActivateAsync()
        {
            this.lifetime = TimeSpan.FromSeconds(10);
            this.lifetimeTimer = RegisterTimer(
              async state =>
              {
                  var items = await AggregateData();
                  var cacheGrain = this.GrainFactory.GetGrain<ICacheGrain<List<FundReport>>>("report");
                  await cacheGrain.Set(items);
              },
              null,
              TimeSpan.FromSeconds(0),
              this.lifetime);

            return base.OnActivateAsync();
        }

        public async Task<List<FundReport>> GetReport()
        {
            var cacheGrain = this.GrainFactory.GetGrain<ICacheGrain<List<FundReport>>>("report");
            var items = await cacheGrain.Get();

            return items;
        }

        public Task TrackFund(string fund)
        {
            this.fundsToReportAbout.Add(fund);
            return Task.CompletedTask;
        }

        private async Task<List<FundReport>> AggregateData()
        { 
            var report = new List<FundReport>();
            foreach (var fund in this.fundsToReportAbout)
            {
                var fundGrain = this.GrainFactory.GetGrain<IFund>(fund);
                var asks = await fundGrain.GetLatestAskPrices();
                var bids  = await fundGrain.GetLatestBidPrices();

                report.Add(new FundReport
                {
                    Name = fund,
                    AmountOfPrices = asks.Count + bids.Count,
                    AverageBid = bids.Average(),
                    AverageAsk = asks.Average()
                });
            }

            return report;
        }
    }
}