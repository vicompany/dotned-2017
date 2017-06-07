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
                    var ask = 1 + rand.Next(0, 1000) / 10000.0m;
                    this.latestAsk.Add(ask);
                    var bid = 1 + rand.Next(0, 1000) / 10000.0m;
                    this.latestBid.Add(bid);

                    this.subscribers.Notify(s => s.SendMessage($@"{{fund: ""{this.GetPrimaryKeyString()}"", ask: {ask.ToString(this.us)}, bid: {ask.ToString(this.us)}}}"));


                    return Task.CompletedTask;
                }, this, TimeSpan.FromSeconds(0), TimeSpan.FromMilliseconds(500));
            await base.OnActivateAsync();
        }

        public Task<decimal> GetLatestAsk()
        {
            if (latestAsk.Count != 0)
            {
                return Task.FromResult(latestAsk[latestAsk.Count - 1]);
            }
            else
            {
                return Task.FromResult(0m);
            }
        }

        public Task<decimal> GetLatestBid()
        {
            if (latestBid.Count != 0)
            {
                return Task.FromResult(latestBid[latestBid.Count - 1]);
            }
            else
            {
                return Task.FromResult(0m);
            }
        }

        public Task<bool> LayOrder(decimal price, bool bid)
        {
            if (bid)
            {
                this.latestBid.Add(price);
            }
            else
            {
                this.latestAsk.Add(price);
            }
            return Task.FromResult(true);
        }

        public async Task SetListener(IFundObserver listenerFundObserver)
        {
            this.subscribers.Subscribe(listenerFundObserver);
        }
    }
}
