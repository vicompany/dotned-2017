using Stock.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

using Orleans;

namespace Stock.Grains
{
    public class FundGrain : Orleans.Grain, IFund
    {
        private decimal offset = 1;
        private readonly CultureInfo us = new CultureInfo("en-US");

        private ObserverSubscriptionManager<IFundObserver> subscribers =
            new ObserverSubscriptionManager<IFundObserver>();
        private List<decimal> latestAskPrices = new List<decimal>();
        private List<decimal> latestBidPrices = new List<decimal>();
        private IDisposable timer;

        public override async Task OnActivateAsync()
        {
            var rand = new Random(System.Environment.TickCount);
            this.timer = this.RegisterTimer((item) =>
                {
                    var ask = offset + rand.Next(0, 1000) / 10000.0m;
                    this.latestAskPrices.Add(ask);
                    var bid = offset + rand.Next(0, 1000) / 10000.0m;
                    this.latestBidPrices.Add(bid);

                    this.subscribers.Notify(s => s.SendMessage($@"{{fund: ""{this.GetPrimaryKeyString()}"", ask: {ask.ToString(this.us)}, bid: {ask.ToString(this.us)}}}"));


                    return Task.CompletedTask;
                }, this, TimeSpan.FromSeconds(0), TimeSpan.FromMilliseconds(500));

            var reporter = this.GrainFactory.GetGrain<IFundReporter>(0);
            await  reporter.TrackFund(this.GetPrimaryKeyString());

            var cachedReporter = this.GrainFactory.GetGrain<ICachedFundReporter>(0);
            await cachedReporter.TrackFund(this.GetPrimaryKeyString());

            await base.OnActivateAsync();
        }

        public Task<List<decimal>> GetLatestAskPrices()
        {
            System.Threading.Thread.Sleep(1000);
            return Task.FromResult(latestAskPrices);
        }

        public Task<List<decimal>> GetLatestBidPrices()
        {
         
            System.Threading.Thread.Sleep(1000);
            return Task.FromResult(latestBidPrices);
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
            catch(Exception)
            {
                
            }
            this.subscribers.Subscribe(listenerFundObserver);
        }
    }
}
