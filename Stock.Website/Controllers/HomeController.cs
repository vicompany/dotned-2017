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
        [HttpGet, Route("")]
        public async Task<IActionResult> Index()
        {
           
            return View("demo");
        }

        [HttpGet, Route("index/{fund}")]
        public async Task<IActionResult> Index(string fund)
        {
            var fundShell = GrainClient.GrainFactory.GetGrain<IFund>(fund);
            var latestBid = await fundShell.GetLatestBid();
            var latestAsk = await fundShell.GetLatestAsk();
            ViewBag.LatestBid = latestBid;
            ViewBag.LatestAsk = latestAsk;
            return View("index");
        }

        [HttpPost, Route("index/{fund}")]
        public async Task<IActionResult> Post(string fund, FundModel change)
        {
            var fundShell = GrainClient.GrainFactory.GetGrain<IFund>(fund);
            if (change.Ask > 0)
            {
                await fundShell.LayOrder(change.Ask, false);
            } 
            else
            {
                await fundShell.LayOrder(change.Bid, true);
            }

            ViewBag.Message = "Order processed";
            return await Index(fund);
        }
    }
}
