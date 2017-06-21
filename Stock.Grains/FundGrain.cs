using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

using Orleans;

using Stock.Interfaces;

namespace Stock.Grains
{
    public class FundGrain : Grain, IFund
    {
        private readonly CultureInfo us = new CultureInfo("en-US");
        private readonly List<decimal> latestAskPrices = new List<decimal>();
        private readonly List<decimal> latestBidPrices = new List<decimal>();
        private readonly ObserverSubscriptionManager<IFundObserver> subscribers =
            new ObserverSubscriptionManager<IFundObserver>();

        private decimal offset = 1;

        private IDisposable timer;

        public override async Task OnActivateAsync()
        {
            var rand = new Random(Environment.TickCount);
            this.timer = RegisterTimer((item) =>
                {
                    var ask = this.offset + rand.Next(0, 1000) / 10000.0m;
                    this.latestAskPrices.Add(ask);
                    var bid = this.offset + rand.Next(0, 1000) / 10000.0m;
                    this.latestBidPrices.Add(bid);

                    this.subscribers.Notify(s => s.SendMessage($@"{{""fund"": {this.GetPrimaryKeyString()}, ""ask"": {ask.ToString(this.us)}, ""bid"": {bid.ToString(this.us)}}}"));


                    return Task.CompletedTask;
                }, this, TimeSpan.FromSeconds(0), TimeSpan.FromMilliseconds(500));

            var reporter = this.GrainFactory.GetGrain<IFundReporter>(0);
            await reporter.TrackFund(this.GetPrimaryKeyString());

            var cachedReporter = this.GrainFactory.GetGrain<ICachedFundReporter>(0);
            await cachedReporter.TrackFund(this.GetPrimaryKeyString());

            await base.OnActivateAsync();
        }

        public Task<List<decimal>> GetLatestAskPrices()
        {
            System.Threading.Thread.Sleep(1000);
            return Task.FromResult(this.latestAskPrices);
        }

        public Task<List<decimal>> GetLatestBidPrices()
        {
         
            System.Threading.Thread.Sleep(1000);
            return Task.FromResult(this.latestBidPrices);
        }

        public Task SetOffset(decimal offset)
        { 
            this.offset = offset;
            return Task.CompletedTask;
        }

        public async Task SetListener(IFundObserver listenerFundObserver)
        {
            try
            {
                this.subscribers.Unsubscribe(listenerFundObserver);
            }
            catch (Exception)
            {
                // Let's ignore this for now
            }

            this.subscribers.Subscribe(listenerFundObserver);
        }
    }
}
