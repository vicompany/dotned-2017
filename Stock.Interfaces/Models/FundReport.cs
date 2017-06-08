namespace Stock.Models
{
    public class FundReport
    {
        public string Name { get; set; }

        public int AmountOfPrices { get; set; }

        public decimal AverageBid { get; set; }

        public decimal AverageAsk { get; set; }
        
    }

}