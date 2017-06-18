using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Stock.Interfaces;
using Orleans;
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
             a = GrainClient.GrainFactory.GetGrain<IFund>("Delta Loyd");
             await a.SetOffset(123);
             a =  GrainClient.GrainFactory.GetGrain<IFund>("Google");
             await a.SetOffset(453);
             a = GrainClient.GrainFactory.GetGrain<IFund>("VI Company");
             await a.SetOffset(42);

            var cached = GrainClient.GrainFactory.GetGrain<ICachedFundReporter>(0);
            
            return RedirectToAction("Demo");
        }
        [HttpGet, Route("demo")]
        public async Task<IActionResult> Demo()
        {
           var cached = GrainClient.GrainFactory.GetGrain<ICachedFundReporter>(0);            
           return View("../Home/demo", new FundReportModel(){ Report = await cached.GetReport() });
        } 

    }
}
