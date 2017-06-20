using System.Collections.Generic;
using Stock.Models;
using Orleans;
using System.Threading.Tasks;

namespace Stock.Interfaces
{
    
    public interface ICachedFundReporter : IGrainWithIntegerKey
    {
        Task TrackFund(string fund);

        Task<List<FundReport>> GetReport();
    }
}
