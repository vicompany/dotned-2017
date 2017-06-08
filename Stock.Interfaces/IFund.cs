using System.Collections.Generic;
using System.Threading.Tasks;

namespace Stock.Interfaces
{
    public interface IFund : Orleans.IGrainWithStringKey
    {
        Task<List<decimal>> GetLatestAsk();
        Task<List<decimal>> GetLatestBid(); 
        Task SetOffset(decimal offset);

        Task SetListener(IFundObserver webSocket);
    }
}
