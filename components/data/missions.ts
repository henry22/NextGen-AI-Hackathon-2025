export interface InvestmentOption {
  id: string;
  name: string;
  description: string;
  risk: string;
  expectedReturn: string;
  actualReturn: number;
  investmentInsight: string;
}

export interface MissionData {
  context: string;
  situation: string;
  options: InvestmentOption[];
  coachAdvice: Record<string, string>;
  outcome: string;
}

export const missionData: Record<number, MissionData> = {
  1990: {
    context:
      "In 1990, Japan's economy was at the peak of its bubble. Tokyo real estate prices soared, and the Nikkei index hit historic highs. However, a crisis was brewing...",
    situation:
      "You have $100,000 in investment capital. The market is filled with optimism, but some economists are beginning to warn of bubble risks.",
    options: [
      {
        id: "stocks",
        name: "Japanese Stocks",
        description: "Invest in Nikkei 225 index fund",
        risk: "High",
        expectedReturn: "15-25%",
        actualReturn: -60,
        investmentInsight: "Japanese stocks are at historic highs due to the economic bubble. While returns look attractive, the market is showing signs of overvaluation with P/E ratios at unsustainable levels.",
      },
      {
        id: "realestate",
        name: "Tokyo Real Estate",
        description: "Purchase apartments in central Tokyo",
        risk: "High",
        expectedReturn: "20-30%",
        actualReturn: -70,
        investmentInsight: "Tokyo real estate prices have increased 10x in the past decade. Land prices in central Tokyo are now the highest in the world, making this a very high-risk speculation.",
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "8-10%",
        actualReturn: 45,
        investmentInsight: "US Treasury bonds offer stable returns backed by the US government. With moderate yields and low volatility, they provide portfolio stability during uncertain times.",
      },
      {
        id: "gold",
        name: "Gold",
        description: "Invest in physical gold",
        risk: "Medium",
        expectedReturn: "5-8%",
        actualReturn: 20,
        investmentInsight: "Gold serves as a hedge against inflation and currency devaluation. While returns are modest, it maintains value during economic uncertainty and provides portfolio diversification.",
      },
    ],
    coachAdvice: {
      "steady-sam":
        "I recommend diversifying investments, putting most of your funds into US Treasury bonds and gold. The Japanese market is too risky.",
      "growth-guru":
        "You can invest a small amount in the Japanese market, but maintain balance. I suggest 40% bonds, 30% stocks, 30% gold.",
      "adventure-alex":
        "This is a once-in-a-lifetime opportunity! Go all-in on Japanese stocks and real estate - the higher the risk, the higher the returns!",
      "yield-yoda":
        "Focus on assets that generate stable returns. US Treasury bonds may not have high returns, but they're the safest during turbulent times.",
    },
    outcome:
      "In 1991, the Bank of Japan began raising interest rates, and the bubble burst. Stock and real estate prices plummeted, beginning the 'Lost Decade'.",
  },
  1997: {
    context:
      "In July 1997, the Thai government announced the abandonment of the fixed exchange rate system between the Thai baht and the US dollar. This decision swept across Asia like a domino effect, triggering one of the most severe regional financial crises in history...",
    situation:
      "You have $100,000 in investment capital. Asian currencies are beginning to depreciate, stock markets are plummeting, but this also creates investment opportunities.",
    options: [
      {
        id: "asian-stocks",
        name: "Asian Stocks",
        description: "Invest in Korean, Thai, and Indonesian stock markets",
        risk: "Extreme",
        expectedReturn: "30-50%",
        actualReturn: -65,
        investmentInsight: "Asian markets are in free fall due to currency crisis. While prices look attractive, capital flight and currency devaluation pose extreme risks to foreign investors.",
      },
      {
        id: "us-stocks",
        name: "US Stocks",
        description: "Invest in S&P 500 index fund",
        risk: "Medium",
        expectedReturn: "12-18%",
        actualReturn: 28,
        investmentInsight: "US stocks are benefiting from being a safe haven during the Asian crisis. The US economy remains strong with steady growth and stable currency.",
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "6-8%",
        actualReturn: 15,
        investmentInsight: "Safe haven asset during the crisis. US government bonds provide stability and capital preservation when global markets are volatile.",
      },
      {
        id: "cash",
        name: "US Dollar Cash",
        description: "Hold US dollars and wait for opportunities",
        risk: "None",
        expectedReturn: "4-5%",
        actualReturn: 8,
        investmentInsight: "Cash provides maximum liquidity and no risk during market turmoil. The US dollar is strengthening against Asian currencies, providing natural hedge.",
      },
    ],
    coachAdvice: {
      "steady-sam":
        "Asian markets are too dangerous! I recommend holding US Treasury bonds and cash, waiting for the storm to pass.",
      "growth-guru":
        "You can moderately invest in US stocks, but avoid Asian markets. I suggest 60% US stocks, 40% bonds.",
      "adventure-alex":
        "Crisis creates opportunity! Asian stocks are super cheap now, it's a great time to buy the dip!",
      "yield-yoda":
        "In uncertain times, cash is king. Maintain liquidity and wait for better investment opportunities.",
    },
    outcome:
      "The Asian financial crisis continued until 1998, with many currencies depreciating by more than 50% and stock markets falling by 60-80%. The US market remained relatively stable, becoming a safe haven for capital.",
  },
  2000: {
    context:
      "In 2000, the internet revolution was changing the world. Tech stock prices soared, and people believed the 'new economy' would forever change investment rules...",
    situation:
      "You have $100,000 in investment capital. The Nasdaq index has risen 400% over the past 5 years, and tech company valuations have reached astronomical levels.",
    options: [
      {
        id: "tech",
        name: "Tech Stocks",
        description: "Invest in Nasdaq 100 index",
        risk: "High",
        expectedReturn: "25-40%",
        actualReturn: -78,
        investmentInsight: "Tech stocks are trading at extreme P/E ratios with many companies having no profits. The dot-com euphoria has created unsustainable valuations based on future growth promises.",
      },
      {
        id: "dotcom",
        name: "Dot-com Startups",
        description: "Invest in .com company stocks",
        risk: "Extreme",
        expectedReturn: "50-100%",
        actualReturn: -95,
        investmentInsight: "Most dot-com companies burn cash with no clear path to profitability. While the internet is revolutionary, current valuations assume perfect execution and unlimited growth.",
      },
      {
        id: "traditional",
        name: "Traditional Stocks",
        description: "Invest in Dow Jones Industrial Average",
        risk: "Medium",
        expectedReturn: "10-15%",
        actualReturn: -25,
        investmentInsight: "Traditional companies have reasonable valuations but face disruption from the internet. They offer more stability than tech stocks but may struggle in the 'new economy'.",
      },
      {
        id: "cash",
        name: "Cash",
        description: "Hold cash and wait for opportunities",
        risk: "None",
        expectedReturn: "3-5%",
        actualReturn: 15,
        investmentInsight: "Cash provides safety and optionality during market euphoria. While earning modest returns, it positions you to invest when asset prices become more reasonable.",
      },
    ],
    coachAdvice: {
      "steady-sam":
        "The market is overheated! I recommend holding cash and waiting for a better entry point.",
      "growth-guru":
        "You can moderately participate in tech stocks, but control the proportion. I suggest 50% cash, 30% traditional stocks, 20% tech stocks.",
      "adventure-alex":
        "The internet revolution has just begun! Go all-in on .com companies - this is a historic opportunity!",
      "yield-yoda":
        "High valuations mean low future returns. Stay patient, cash is king.",
    },
    outcome:
      "In March 2000, the dot-com bubble burst. The Nasdaq index fell 78% over the next two years, and many .com companies went bankrupt.",
  },
  2008: {
    context:
      "In September 2008, Lehman Brothers declared bankruptcy, triggering a global financial tsunami. The subprime mortgage crisis spread from the US to the world, and the banking system faced collapse...",
    situation:
      "You have $100,000 in investment capital. Global stock markets are plummeting, credit markets are frozen, but central banks are beginning massive rescue operations.",
    options: [
      {
        id: "stocks",
        name: "Global Stocks",
        description: "Invest in MSCI World Index",
        risk: "Extreme",
        expectedReturn: "20-30%",
        actualReturn: -55,
        investmentInsight: "Global deleveraging and credit contraction are causing widespread stock selloffs. While prices may look attractive, corporate earnings face severe headwinds from recession.",
      },
      {
        id: "banks",
        name: "Banking Stocks",
        description: "Invest in financial sector stocks",
        risk: "Extreme",
        expectedReturn: "40-60%",
        actualReturn: -75,
        investmentInsight: "Banks face potential insolvency from mortgage losses and frozen credit markets. While government bailouts may help, massive writedowns and dilution pose extreme risks to shareholders.",
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "4-6%",
        actualReturn: 25,
        investmentInsight: "Flight-to-quality drives demand for US Treasuries during the financial crisis. Government bonds offer safety and capital appreciation as yields fall amid Fed rate cuts.",
      },
      {
        id: "gold",
        name: "Gold",
        description: "Invest in physical gold",
        risk: "Medium",
        expectedReturn: "8-12%",
        actualReturn: 35,
        investmentInsight: "Gold serves as a hedge against financial system collapse and currency debasement. Central bank money printing and economic uncertainty drive demand for this traditional safe haven.",
      },
    ],
    coachAdvice: {
      "steady-sam":
        "This is a once-in-a-century crisis! Go all-in on US Treasury bonds and gold, stay away from the stock market.",
      "growth-guru":
        "Stay calm during the crisis. I suggest 70% bonds, 20% gold, 10% stocks, entering in batches.",
      "adventure-alex":
        "Stocks are super cheap now! This is a once-in-a-lifetime opportunity to buy the dip - go all-in!",
      "yield-yoda":
        "Stay rational in panic. Treasury bonds and gold are the safest havens.",
    },
    outcome:
      "In 2008-2009, global stock markets fell by more than 50%, but US Treasury bonds and gold became safe-haven assets. Central banks implemented massive quantitative easing, laying the foundation for subsequent recovery.",
  },
  2020: {
    context:
      "In March 2020, the COVID-19 pandemic spread globally, and countries implemented lockdown measures. Stock markets plummeted 30% in just one month, but unprecedented central bank stimulus policies were about to emerge...",
    situation:
      "You have $100,000 in investment capital. Market panic has reached its peak, but tech stocks are beginning to show resilience.",
    options: [
      {
        id: "tech-stocks",
        name: "Tech Stocks",
        description: "Invest in FAANG and other tech giants",
        risk: "Medium",
        expectedReturn: "15-25%",
        actualReturn: 85,
        investmentInsight: "Tech companies are benefiting from pandemic-driven digital transformation. Remote work and e-commerce trends favor these giants with strong balance sheets.",
      },
      {
        id: "travel-stocks",
        name: "Travel & Airlines",
        description: "Invest in airline, cruise, and hotel stocks",
        risk: "Extreme",
        expectedReturn: "50-100%",
        actualReturn: -45,
        investmentInsight: "Travel industry faces unprecedented disruption from lockdowns and border closures. While eventual recovery is likely, airlines carry high debt loads and may face bankruptcy or dilution.",
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "2-4%",
        actualReturn: 12,
        investmentInsight: "Ultra-low interest rates and massive Fed stimulus create safe haven demand for Treasuries. While yields are low, bonds provide stability during market volatility.",
      },
      {
        id: "gold",
        name: "Gold",
        description: "Invest in physical gold",
        risk: "Medium",
        expectedReturn: "8-15%",
        actualReturn: 28,
        investmentInsight: "Unprecedented monetary stimulus and negative real interest rates favor gold as an inflation hedge. Central bank money printing and currency debasement concerns drive precious metal demand.",
      },
    ],
    coachAdvice: {
      "steady-sam":
        "The pandemic's impact is hard to predict. I recommend investing in safe-haven assets like Treasury bonds and gold.",
      "growth-guru":
        "Tech stocks benefit from digital transformation and can be moderately allocated. I suggest 50% tech stocks, 30% bonds, 20% gold.",
      "adventure-alex":
        "Travel stocks have hit rock bottom. The pandemic will end eventually - now is the perfect time to buy the dip!",
      "yield-yoda":
        "Focus on pandemic-benefiting industries like tech, healthcare, and e-commerce.",
    },
    outcome:
      "In the second half of 2020, tech stocks surged, and travel stocks rebounded after vaccines emerged, but overall tech stocks performed best. Central banks' massive money printing pushed up asset prices.",
  },
  2025: {
    context:
      "In 2025, the world faces multiple challenges including inflationary pressures, central bank rate hikes, and geopolitical tensions. The AI revolution is changing industry landscapes, but market volatility is intensifying...",
    situation:
      "You have $100,000 in investment capital. Inflation remains high, interest rates are at multi-year highs, but AI and green energy industries are showing strong growth.",
    options: [
      {
        id: "ai-stocks",
        name: "AI Tech Stocks",
        description: "Invest in artificial intelligence related companies",
        risk: "High",
        expectedReturn: "20-40%",
        actualReturn: 0,
        investmentInsight: "AI revolution is transforming industries, but valuations are high and competition intense. Early winners may dominate, but market is still evolving rapidly.",
      },
      {
        id: "energy",
        name: "Green Energy Stocks",
        description: "Invest in solar, wind and other green energy",
        risk: "High",
        expectedReturn: "15-30%",
        actualReturn: 0,
        investmentInsight: "Government subsidies and climate initiatives drive green energy adoption, but rising interest rates hurt capital-intensive projects. Regulatory changes and competition create volatility.",
      },
      {
        id: "tips",
        name: "Inflation-Protected Bonds",
        description: "Purchase Treasury Inflation-Protected Securities (TIPS)",
        risk: "Low",
        expectedReturn: "5-8%",
        actualReturn: 0,
        investmentInsight: "TIPS provide direct inflation protection as principal adjusts with CPI changes. With persistent inflation concerns and high nominal rates, they offer real return preservation.",
      },
      {
        id: "commodities",
        name: "Commodities",
        description: "Invest in oil, gold, and agricultural products",
        risk: "Medium",
        expectedReturn: "10-20%",
        actualReturn: 0,
        investmentInsight: "Geopolitical tensions and supply chain disruptions support commodity prices as inflation hedges. However, recession risks and central bank tightening may dampen demand.",
      },
    ],
    coachAdvice: {
      "steady-sam":
        "In uncertain times, I recommend investing in inflation-protected bonds and commodities to preserve value.",
      "growth-guru":
        "AI is the future trend, but balance the risks. I suggest 40% AI stocks, 30% inflation-protected bonds, 30% commodities.",
      "adventure-alex":
        "The AI revolution has just begun! Go all-in on AI tech stocks - this is the theme of the next decade!",
      "yield-yoda":
        "In an inflationary environment, physical assets and inflation-protected bonds are the best choices.",
    },
    outcome:
      "This is a current ongoing event, and the results are yet to be determined. Your investment decisions will impact future wealth accumulation!",
  },
};