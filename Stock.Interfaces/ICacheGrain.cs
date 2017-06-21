using System; 
using System.Threading.Tasks;

namespace Stock.Interfaces
{
   public interface ICacheGrain<T> : Orleans.IGrainWithStringKey
    {
        Task<T> Get();

        Task Set(T item, TimeSpan? lifeTime = null);
    }
}
