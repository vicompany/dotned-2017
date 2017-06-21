using System.Collections.Generic;
using System.Threading.Tasks;

using Orleans;

using Stock.Models;

namespace Stock.Interfaces
{
    public interface IFundReporter : IGrainWithIntegerKey
    {
        Task TrackFund(string fund);

        Task<List<FundReport>> GetReport();
    }
}
