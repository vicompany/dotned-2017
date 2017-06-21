using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;

using Orleans;

using Stock.Interfaces;
using Stock.Website.Models;

namespace Stock.Website.Controllers
{ 
    [Route("cached")]
    public class HomeCachedController : Controller
    {
        [HttpGet, Route("init")]
        public async Task<IActionResult> Init()
        {
             var a = GrainClient.GrainFactory.GetGrain<IFund>("Shell");
             await a.SetOffset(23); 
             a = GrainClient.GrainFactory.GetGrain<IFund>("Delta Lloyd");
             await a.SetOffset(123);
             a = GrainClient.GrainFactory.GetGrain<IFund>("Google");
             await a.SetOffset(453);
             a = GrainClient.GrainFactory.GetGrain<IFund>("VI Company");
             await a.SetOffset(42);
            
            return RedirectToAction("Demo");
        }

        [HttpGet, Route("demo")]
        public async Task<IActionResult> Demo()
        {
           var cached = GrainClient.GrainFactory.GetGrain<ICachedFundReporter>(0);            
           return View("../Home/demo", new FundReportModel { Report = await cached.GetReport() });
        }
    }
}
