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
        private List<decimal> latestAsk = new List<decimal>();
        private List<decimal> latestBid = new List<decimal>();
        private IDisposable timer;

        public override async Task OnActivateAsync()
        {
            var rand = new Random(System.Environment.TickCount);
            this.timer = this.RegisterTimer((item) =>
                {
                    var ask = offset + rand.Next(0, 1000) / 10000.0m;
                    this.latestAsk.Add(ask);
                    var bid = offset + rand.Next(0, 1000) / 10000.0m;
                    this.latestBid.Add(bid);

                    this.subscribers.Notify(s => s.SendMessage($@"{{fund: ""{this.GetPrimaryKeyString()}"", ask: {ask.ToString(this.us)}, bid: {ask.ToString(this.us)}}}"));


                    return Task.CompletedTask;
                }, this, TimeSpan.FromSeconds(0), TimeSpan.FromMilliseconds(500));

            var reporter = this.GrainFactory.GetGrain<IFundReporter>(0);
            await  reporter.ReportAboutFund(this.GetPrimaryKeyString());

            var cachedReporter = this.GrainFactory.GetGrain<ICachedFundReporter>(0);
            await cachedReporter.ReportAboutFund(this.GetPrimaryKeyString());

            await base.OnActivateAsync();
        }

        public Task<List<decimal>> GetLatestAsk()
        {
            System.Threading.Thread.Sleep(1000);
            return Task.FromResult(latestAsk);
        }

        public Task<List<decimal>> GetLatestBid()
        {
         
            System.Threading.Thread.Sleep(1000);
            return Task.FromResult(latestBid);
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
