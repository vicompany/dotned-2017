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
    public class HomeController : Controller
    {
        [HttpGet, Route("init")]
        public async Task<IActionResult> Init()
        {
             var a = GrainClient.GrainFactory.GetGrain<IFund>("Shell");
             await a.SetOffset(23); 
             a = GrainClient.GrainFactory.GetGrain<IFund>("Delta Lloyd");
             await a.SetOffset(123);
             a =  GrainClient.GrainFactory.GetGrain<IFund>("Google");
             await a.SetOffset(453);
             a = GrainClient.GrainFactory.GetGrain<IFund>("VI Company");
             await a.SetOffset(42);

            return RedirectToAction("Demo");
        }
        [HttpGet, Route("demo")]
        public async Task<IActionResult> Demo()
        {
           var reporter = GrainClient.GrainFactory.GetGrain<IFundReporter>(0);
           var items = await reporter.GetReport();
           return View("demo", new FundReportModel(){ Report = items });
        }

        [HttpGet, Route("index/{fund}")]
        public async Task<IActionResult> Index(string fund)
        {
            var fundShell = GrainClient.GrainFactory.GetGrain<IFund>(fund);
            var latestBid = await fundShell.GetLatestBidPrices();
            var latestAsk = await fundShell.GetLatestAskPrices();
            ViewBag.LatestBid = latestBid;
            ViewBag.LatestAsk = latestAsk;
            return View("index");
        }

    }
}
