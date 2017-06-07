
using Orleans;

namespace Stock.Interfaces
{
    public interface IFundObserver  : IGrainObserver
    {
        void SendMessage(string message);
    }
}
