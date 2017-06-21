using System;
using System.Threading.Tasks;

using Orleans;

using Stock.Interfaces;

namespace Stock.Grains
{
    public class CacheGrain<T> : Grain, ICacheGrain<T>
    {
        private T cachedItem;
        private IDisposable lifetimeTimer;
 
        public Task Set(T item, TimeSpan? lifeTime)
        {
            this.cachedItem = item;
            if (lifeTime.HasValue)
            {
                this.lifetimeTimer?.Dispose();
                this.lifetimeTimer = RegisterTimer(
                    async state => { await Invalidate(); },
                    null,
                    lifeTime.Value,
                    TimeSpan.MaxValue);

                DelayDeactivation(lifeTime.Value);
            }

            return Task.CompletedTask;
        }

        public Task<T> Get()
        {
            return Task.FromResult(this.cachedItem);
        }

        public Task Invalidate()
        {
            DeactivateOnIdle();
            this.cachedItem = default(T);
            this.lifetimeTimer?.Dispose();

            return Task.CompletedTask;
        }
    }
}
