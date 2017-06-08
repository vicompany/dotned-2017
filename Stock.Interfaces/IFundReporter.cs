using System.Collections.Generic;
using Stock.Models;
using Orleans;
using System.Threading.Tasks;

namespace Stock.Interfaces
{
    
    public interface IFundReporter  : IGrainWithIntegerKey
    {
        Task ReportAboutFund(string fund);

        Task<List<FundReport>> GetReport();
    }
}