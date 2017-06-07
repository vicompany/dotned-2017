using System.Net.WebSockets;
using System.Threading.Tasks;

namespace Stock.Interfaces
{
    public interface IFund : Orleans.IGrainWithStringKey
    {
        Task<decimal> GetLatestAsk();
        Task<decimal> GetLatestBid();
        Task<bool> LayOrder(decimal price, bool bid);

        Task SetListener(IFundObserver webSocket);
    }
}
